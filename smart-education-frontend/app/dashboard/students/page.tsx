'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { ClassRoom, Student } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Modal } from '@/components/Modal';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classRoomId, setClassRoomId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  async function loadStudents(filterId?: string) {
    setLoading(true);
    try {
      const query = filterId ? `?classRoomId=${filterId}` : '';
      const data = await api.get<Student[]>(`/students${query}`);
      setStudents(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
    api.get<ClassRoom[]>('/classes').then(setClasses).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(id: string) {
    setClassFilter(id);
    loadStudents(id || undefined);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/students', {
        fullName,
        rollNumber,
        classRoomId: classRoomId || undefined,
        guardianName: guardianName || undefined,
        guardianPhone: guardianPhone || undefined,
      });
      setModalOpen(false);
      setFullName('');
      setRollNumber('');
      setClassRoomId('');
      setGuardianName('');
      setGuardianPhone('');
      loadStudents(classFilter || undefined);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this student record?')) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents(classFilter || undefined);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to remove student');
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Student profiles and class assignments."
        action={
          isAdmin ? (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              New student
            </button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <select
          className="input max-w-xs"
          value={classFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.section ? ` — ${c.section}` : ''}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-rust">{error}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60">
            <tr>
              <th className="px-4 py-3 font-medium text-ink/60">Roll</th>
              <th className="px-4 py-3 font-medium text-ink/60">Name</th>
              <th className="px-4 py-3 font-medium text-ink/60">Class</th>
              <th className="px-4 py-3 font-medium text-ink/60">Guardian</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center font-mono text-ink/40">
                  Loading…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/40">
                  No students yet.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {s.classRoom
                      ? `${s.classRoom.name}${s.classRoom.section ? ' — ' + s.classRoom.section : ''}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {s.guardianName || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(s.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New student">
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
              Roll number
            </label>
            <input
              required
              className="input"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Class
            </label>
            <select
              className="input"
              value={classRoomId}
              onChange={(e) => setClassRoomId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.section ? ` — ${c.section}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Guardian name
            </label>
            <input
              className="input"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Guardian phone
            </label>
            <input
              className="input"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
            />
          </div>

          {formError && <p className="text-sm text-rust">{formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Create student'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
