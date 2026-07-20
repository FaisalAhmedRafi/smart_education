'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { ClassRoom, User } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Modal } from '@/components/Modal';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [classTeacherId, setClassTeacherId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  async function loadClasses() {
    setLoading(true);
    try {
      const data = await api.get<ClassRoom[]>('/classes');
      setClasses(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
    if (isAdmin) {
      api
        .get<User[]>('/users')
        .then((all) => setTeachers(all.filter((u) => u.role === 'teacher')))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/classes', {
        name,
        section: section || undefined,
        academicYear,
        classTeacherId: classTeacherId || undefined,
      });
      setModalOpen(false);
      setName('');
      setSection('');
      setClassTeacherId('');
      loadClasses();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this class? Students in it will be unassigned, not deleted.')) return;
    try {
      await api.delete(`/classes/${id}`);
      loadClasses();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete class');
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Sections and academic years."
        action={
          isAdmin ? (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              New class
            </button>
          ) : undefined
        }
      />

      {error && <p className="mb-4 text-sm text-rust">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="font-mono text-sm text-ink/40">Loading…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-ink/40">No classes yet.</p>
        ) : (
          classes.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="font-display text-lg font-semibold text-ink">
                {c.name}
                {c.section ? ` — ${c.section}` : ''}
              </p>
              <p className="mt-1 font-mono text-xs text-ink/50">
                {c.academicYear}
              </p>
              <p className="mt-3 text-sm text-ink/70">
                Class teacher:{' '}
                {c.classTeacher ? c.classTeacher.fullName : 'Unassigned'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="mt-4 text-xs text-rust underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New class">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Name
            </label>
            <input
              required
              className="input"
              placeholder="Grade 10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Section
            </label>
            <input
              className="input"
              placeholder="A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Academic year
            </label>
            <input
              required
              className="input"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
              Class teacher
            </label>
            <select
              className="input"
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          {formError && <p className="text-sm text-rust">{formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Create class'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
