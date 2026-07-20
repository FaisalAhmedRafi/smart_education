'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { accessToken } = await api.post<{ accessToken: string }>(
        '/auth/register',
        { fullName, email, password, role: 'admin' },
      );
      localStorage.setItem('token', accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Register the first admin
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Once this account exists, use it to create teacher and student
          accounts from the dashboard instead of this page.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Full name
            </label>
            <input
              required
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
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
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-sm bg-rust/10 px-3 py-2 text-sm text-rust">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Create admin account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
