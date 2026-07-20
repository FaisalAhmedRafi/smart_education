'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { Role, User } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Modal } from '@/components/Modal';

const stampClass: Record<Role, string> = {
  admin: 'stamp-admin',
  teacher: 'stamp-teacher',
  student: 'stamp-student',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.get<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/users', { fullName, email, password, role });
      setModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('teacher');
      loadUsers();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to remove user');
    }
  }

  if (currentUser?.role !== 'admin') {
    return <p className="text-sm text-ink/60">You don't have access to this page.</p>;
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Accounts for admins, teachers, and students."
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            New user
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-rust">{error}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60">
            <tr>
              <th className="px-4 py-3 font-medium text-ink/60">Name</th>
              <th className="px-4 py-3 font-medium text-ink/60">Email</th>
              <th className="px-4 py-3 font-medium text-ink/60">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center font-mono text-ink/40">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink/40">
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{u.fullName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={stampClass[u.role]}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-xs text-rust underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New user">
        <form onSubmit={handleCreate} className="space-y-4">
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
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Role
            </label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          {formError && <p className="text-sm text-rust">{formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
