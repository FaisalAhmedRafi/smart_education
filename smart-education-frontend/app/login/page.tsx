'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth, ApiError } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* left: identity panel */}
      <div className="relative hidden flex-col justify-between bg-indigo p-12 text-paper md:flex">
        <div className="flex items-center gap-3">
          <div className="stamp border-brass text-brass bg-indigo">SE</div>
          <span className="font-mono text-xs uppercase tracking-widest text-paper/60">
            Smart Education
          </span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            The school register,
            <br />
            kept in one place.
          </h1>
          <p className="mt-4 max-w-sm text-paper/60">
            Attendance, grades, classes, and every student's record —
            signed in and up to date.
          </p>
        </div>
        <p className="font-mono text-xs text-paper/40">
          Admin · Teacher · Student
        </p>
      </div>

      {/* right: form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            Enter your credentials to open the register.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
                Email
              </label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
                Password
              </label>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm bg-rust/10 px-3 py-2 text-sm text-rust">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink/40">
            No account yet?{' '}
            <Link href="/register" className="text-indigo underline">
              Register the first admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
