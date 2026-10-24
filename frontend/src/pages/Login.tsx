import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FieldError } from "../components/State";
import { validateEmail, validatePassword } from "../utils/validation";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const hasClientError = Boolean(emailError || passwordError);
  const destination =
    (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setServerError(null);

    if (hasClientError) {
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const activeEmailError = touched ? emailError : null;
  const activePasswordError = touched ? passwordError : null;

  return (
    <main className="shell flex min-h-screen items-center justify-center py-10">
      <section className="surface w-full max-w-md p-6 sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Auto Yard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Browse the inventory and manage purchases with your credentials.
          </p>
        </header>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setServerError(null);
              }}
              onBlur={() => setTouched(true)}
              required
            />
            <FieldError testId="email-error" message={activeEmailError} />
          </div>

          <div>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setServerError(null);
              }}
              onBlur={() => setTouched(true)}
              required
              minLength={8}
              maxLength={72}
            />
            <p className="mt-1 text-xs text-muted">
              Must be between 8 and 72 characters.
            </p>
            <FieldError testId="password-error" message={activePasswordError} />
          </div>

          <FieldError message={serverError} />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Need an account?{" "}
          <Link className="link" to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
