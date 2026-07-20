'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { Attendance, AttendanceStatus, ClassRoom, Student } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'student' ? <StudentAttendanceView /> : <MarkAttendanceView />;
}

function StudentAttendanceView() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get<Student | null>('/students/me');
        if (!me) {
          setError('No student profile is linked to your account yet. Ask an admin to link it.');
          return;
        }
        const data = await api.get<Attendance[]>(`/attendance/student/${me.id}`);
        setRecords(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="My attendance" description="Your day-by-day record." />
      {error && <p className="mb-4 text-sm text-rust">{error}</p>}
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60">
            <tr>
              <th className="px-4 py-3 font-medium text-ink/60">Date</th>
              <th className="px-4 py-3 font-medium text-ink/60">Status</th>
              <th className="px-4 py-3 font-medium text-ink/60">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center font-mono text-ink/40">
                  Loading…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink/40">
                  No attendance recorded yet.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{r.date}</td>
                  <td className={`px-4 py-3 capitalize status-${r.status}`}>{r.status}</td>
                  <td className="px-4 py-3 text-ink/60">{r.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarkAttendanceView() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState<Student[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<ClassRoom[]>('/classes').then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    Promise.all([
      api.get<Student[]>(`/students?classRoomId=${classId}`),
      api
        .get<Attendance[]>(`/attendance/class/${classId}?date=${date}`)
        .catch(() => [] as Attendance[]),
    ])
      .then(([studentsData, existing]) => {
        setStudents(studentsData);
        const initial: Record<string, AttendanceStatus> = {};
        studentsData.forEach((s) => {
          const existingRecord = existing.find((r) => r.studentId === s.id);
          initial[s.id] = existingRecord?.status || 'present';
        });
        setStatusMap(initial);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load class roster');
      })
      .finally(() => setLoading(false));
  }, [classId, date]);

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/attendance', {
        classRoomId: classId,
        date,
        entries: students.map((s) => ({
          studentId: s.id,
          status: statusMap[s.id] || 'present',
        })),
      });
      setSuccess('Attendance saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Attendance" description="Mark attendance for a class and date." />

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
            Class
          </label>
          <select
            className="input min-w-[220px]"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select a class</option>
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
            Date
          </label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-rust">{error}</p>}
      {success && <p className="mb-4 text-sm text-sage">{success}</p>}

      {!classId ? (
        <p className="text-sm text-ink/40">Choose a class to load its roster.</p>
      ) : loading ? (
        <p className="font-mono text-sm text-ink/40">Loading roster…</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-ink/40">No students in this class yet.</p>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper/60">
                <tr>
                  <th className="px-4 py-3 font-medium text-ink/60">Roll</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Name</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{s.rollNumber}</td>
                    <td className="px-4 py-3">{s.fullName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        {STATUSES.map((status) => (
                          <label
                            key={status}
                            className="flex cursor-pointer items-center gap-1.5 text-xs capitalize"
                          >
                            <input
                              type="radio"
                              name={`status-${s.id}`}
                              checked={statusMap[s.id] === status}
                              onChange={() =>
                                setStatusMap((prev) => ({ ...prev, [s.id]: status }))
                              }
                            />
                            <span className={`status-${status}`}>{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-4"
          >
            {submitting ? 'Saving…' : 'Save attendance'}
          </button>
        </>
      )}
    </div>
  );
}
