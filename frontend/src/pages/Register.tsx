import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FieldError } from "../components/State";
import { validateEmail, validatePassword } from "../utils/validation";
import { ApiError } from "../api/client";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const hasClientError = Boolean(emailError || passwordError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setServerError(null);
    setFieldErrors({});

    if (hasClientError) {
      return;
    }

    setSubmitting(true);

    try {
      await register(email.trim(), password);
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
          setFieldErrors(error.fieldErrors);
        } else if (error.code === "EMAIL_TAKEN") {
          setFieldErrors({ email: error.message });
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const activeEmailError = touched ? (fieldErrors.email ?? emailError) : null;
  const activePasswordError = touched
    ? (fieldErrors.password ?? passwordError)
    : null;

  return (
    <main className="shell flex min-h-screen items-center justify-center py-10 showroom-glow">
      <section className="surface w-full max-w-md p-6 sm:p-8">
        <header className="mb-6">
          <p className="text-overline">Auto Yard</p>
          <h1 className="mt-2 font-display text-section-title tracking-tight text-ink">
            Create an account
          </h1>
          <p className="mt-2 font-sans text-body text-muted">
            Register as a customer to browse and purchase vehicles.
          </p>
        </header>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className="input"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setServerError(null);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              onBlur={() => setTouched(true)}
              required
            />
            <FieldError testId="email-error" message={activeEmailError} />
          </div>

          <div>
            <label className="label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setServerError(null);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              onBlur={() => setTouched(true)}
              required
              minLength={8}
              maxLength={72}
            />
            <p className="mt-1 text-xs text-muted">
              8-72 characters, max 72 UTF-8 bytes.
            </p>
            <FieldError testId="password-error" message={activePasswordError} />
          </div>

          {serverError && (
            <div className="flex flex-col gap-2">
              <FieldError message={serverError} />
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => setServerError(null)}
              >
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link className="link" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
