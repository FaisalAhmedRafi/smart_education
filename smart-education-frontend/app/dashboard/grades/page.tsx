'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { ExamType, Grade, Student } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';

const EXAM_TYPES: ExamType[] = ['quiz', 'assignment', 'midterm', 'final'];

export default function GradesPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'student' ? <StudentGradesView /> : <TeacherGradesView />;
}

function GradeTable({ grades }: { grades: Grade[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-paper/60">
          <tr>
            <th className="px-4 py-3 font-medium text-ink/60">Subject</th>
            <th className="px-4 py-3 font-medium text-ink/60">Exam</th>
            <th className="px-4 py-3 font-medium text-ink/60">Term</th>
            <th className="px-4 py-3 font-medium text-ink/60 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {grades.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-ink/40">
                No grades recorded yet.
              </td>
            </tr>
          ) : (
            grades.map((g) => {
              const pct = (g.marksObtained / g.totalMarks) * 100;
              return (
                <tr key={g.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{g.subject}</td>
                  <td className="px-4 py-3 capitalize text-ink/70">{g.examType}</td>
                  <td className="px-4 py-3 text-ink/70">{g.term}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {g.marksObtained}/{g.totalMarks}{' '}
                    <span
                      className={pct >= 60 ? 'text-sage' : pct >= 40 ? 'text-brass' : 'text-rust'}
                    >
                      ({pct.toFixed(0)}%)
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function StudentGradesView() {
  const [grades, setGrades] = useState<Grade[]>([]);
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
        const data = await api.get<Grade[]>(`/grades/student/${me.id}`);
        setGrades(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load grades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="My grades" description="Your results across every subject." />
      {error && <p className="mb-4 text-sm text-rust">{error}</p>}
      {loading ? (
        <p className="font-mono text-sm text-ink/40">Loading…</p>
      ) : (
        <GradeTable grades={grades} />
      )}
    </div>
  );
}

function TeacherGradesView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState<ExamType>('quiz');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [term, setTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Student[]>('/students').then(setStudents).catch(() => {});
  }, []);

  async function loadGrades(id: string) {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Grade[]>(`/grades/student/${id}`);
      setGrades(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  }

  function handleStudentChange(id: string) {
    setStudentId(id);
    if (id) loadGrades(id);
    else setGrades([]);
  }

  async function handleAddGrade(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/grades', {
        studentId,
        subject,
        examType,
        marksObtained: Number(marksObtained),
        totalMarks: Number(totalMarks),
        term,
      });
      setSubject('');
      setMarksObtained('');
      setTerm('');
      loadGrades(studentId);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to record grade');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Grades" description="Record and review student results." />

      <div className="mb-6">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
          Student
        </label>
        <select
          className="input max-w-sm"
          value={studentId}
          onChange={(e) => handleStudentChange(e.target.value)}
        >
          <option value="">Select a student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.rollNumber} — {s.fullName}
            </option>
          ))}
        </select>
      </div>

      {!studentId ? (
        <p className="text-sm text-ink/40">Choose a student to view or add grades.</p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-rust">{error}</p>}

          <div className="mb-6 card p-5">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
              Add a grade
            </p>
            <form onSubmit={handleAddGrade} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <input
                required
                placeholder="Subject"
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <select
                className="input"
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Term (e.g. Term 1)"
                className="input"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Marks obtained"
                className="input"
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Total marks"
                className="input"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : 'Add grade'}
              </button>
            </form>
            {formError && <p className="mt-2 text-sm text-rust">{formError}</p>}
          </div>

          {loading ? (
            <p className="font-mono text-sm text-ink/40">Loading…</p>
          ) : (
            <GradeTable grades={grades} />
          )}
        </>
      )}
    </div>
  );
}
