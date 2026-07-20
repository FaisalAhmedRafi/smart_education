'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ClassRoom, Student, User } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const classesData = await api.get<ClassRoom[]>('/classes');
        setClasses(classesData);

        if (user!.role !== 'student') {
          const studentsData = await api.get<Student[]>('/students');
          setStudents(studentsData);
        }
        if (user!.role === 'admin') {
          const usersData = await api.get<User[]>('/users');
          setUsers(usersData);
        }
      } catch {
        // dashboard is best-effort; individual pages surface their own errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.fullName.split(' ')[0]}`}
        description="Here's what's in the register right now."
      />

      {loading ? (
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {user.role === 'admin' && (
            <StatCard label="Users" value={users.length} />
          )}
          <StatCard label="Classes" value={classes.length} />
          {user.role !== 'student' && (
            <StatCard label="Students" value={students.length} />
          )}
        </div>
      )}

      <div className="mt-10 card p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          Quick links
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {user.role === 'admin' && (
            <>
              <a href="/dashboard/users" className="text-indigo underline">
                Manage users
              </a>
              <a href="/dashboard/classes" className="text-indigo underline">
                Manage classes
              </a>
              <a href="/dashboard/students" className="text-indigo underline">
                Manage students
              </a>
            </>
          )}
          {(user.role === 'admin' || user.role === 'teacher') && (
            <>
              <a href="/dashboard/attendance" className="text-indigo underline">
                Mark attendance
              </a>
              <a href="/dashboard/grades" className="text-indigo underline">
                Record grades
              </a>
            </>
          )}
          {user.role === 'student' && (
            <>
              <a href="/dashboard/attendance" className="text-indigo underline">
                My attendance
              </a>
              <a href="/dashboard/grades" className="text-indigo underline">
                My grades
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
