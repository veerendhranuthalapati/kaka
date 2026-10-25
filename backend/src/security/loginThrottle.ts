export type LoginThrottleConfig = {
  maxFailuresPerIpEmail: number;
  failureWindowMs: number;
  maxFailuresPerEmail: number;
  lockoutMs: number;
  maxKeys: number;
};

type Entry = {
  failures: number;
  windowStart: number;
  lastAccess: number;
};

type EmailEntry = {
  failures: number;
  lockedUntil: number;
  lastAccess: number;
};

export class LoginThrottleStore {
  private readonly ipEmail = new Map<string, Entry>();
  private readonly emailGlobal = new Map<string, EmailEntry>();
  private readonly config: LoginThrottleConfig;

  constructor(config: LoginThrottleConfig) {
    this.config = config;
  }

  private touchIpEmail(key: string): Entry {
    const now = Date.now();
    let entry = this.ipEmail.get(key);
    if (!entry) {
      entry = { failures: 0, windowStart: now, lastAccess: now };
      this.ipEmail.set(key, entry);
      this.evictIfNeeded();
    }
    entry.lastAccess = now;
    return entry;
  }

  private touchEmail(email: string): EmailEntry {
    const now = Date.now();
    let entry = this.emailGlobal.get(email);
    if (!entry) {
      entry = { failures: 0, lockedUntil: 0, lastAccess: now };
      this.emailGlobal.set(email, entry);
      this.evictIfNeeded();
    }
    entry.lastAccess = now;
    return entry;
  }

  private evictIfNeeded(): void {
    const total = this.ipEmail.size + this.emailGlobal.size;
    if (total <= this.config.maxKeys) return;
    const candidates: { key: string; map: "ip" | "email"; lastAccess: number }[] = [];
    for (const [key, entry] of this.ipEmail) {
      candidates.push({ key, map: "ip", lastAccess: entry.lastAccess });
    }
    for (const [key, entry] of this.emailGlobal) {
      candidates.push({ key, map: "email", lastAccess: entry.lastAccess });
    }
    candidates.sort((a, b) => a.lastAccess - b.lastAccess);
    const toRemove = total - this.config.maxKeys;
    for (let i = 0; i < toRemove && i < candidates.length; i += 1) {
      const item = candidates[i];
      if (item.map === "ip") this.ipEmail.delete(item.key);
      else this.emailGlobal.delete(item.key);
    }
  }

  isBlocked(ip: string, email: string, now = Date.now()): boolean {
    const emailEntry = this.emailGlobal.get(email);
    if (emailEntry && emailEntry.lockedUntil > now) return true;

    const key = `${ip}::${email}`;
    const entry = this.ipEmail.get(key);
    if (!entry) return false;
    if (now - entry.windowStart > this.config.failureWindowMs) {
      this.ipEmail.delete(key);
      return false;
    }
    return entry.failures >= this.config.maxFailuresPerIpEmail;
  }

  retryAfterSeconds(ip: string, email: string, now = Date.now()): number {
    const emailEntry = this.emailGlobal.get(email);
    if (emailEntry && emailEntry.lockedUntil > now) {
      return Math.ceil((emailEntry.lockedUntil - now) / 1000);
    }
    const key = `${ip}::${email}`;
    const entry = this.ipEmail.get(key);
    if (!entry) return 60;
    const windowEnd = entry.windowStart + this.config.failureWindowMs;
    return Math.max(1, Math.ceil((windowEnd - now) / 1000));
  }

  recordFailure(ip: string, email: string, now = Date.now()): void {
    const key = `${ip}::${email}`;
    const entry = this.touchIpEmail(key);
    if (now - entry.windowStart > this.config.failureWindowMs) {
      entry.failures = 0;
      entry.windowStart = now;
    }
    entry.failures += 1;

    const emailEntry = this.touchEmail(email);
    emailEntry.failures += 1;
    if (emailEntry.failures >= this.config.maxFailuresPerEmail) {
      emailEntry.lockedUntil = now + this.config.lockoutMs;
    }
  }

  recordSuccess(ip: string, email: string): void {
    const key = `${ip}::${email}`;
    this.ipEmail.delete(key);
  }

  reset(): void {
    this.ipEmail.clear();
    this.emailGlobal.clear();
  }
}
