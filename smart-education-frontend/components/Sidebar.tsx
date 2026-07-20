'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', roles: ['admin', 'teacher', 'student'] },
  { href: '/dashboard/users', label: 'Users', roles: ['admin'] },
  { href: '/dashboard/classes', label: 'Classes', roles: ['admin', 'teacher', 'student'] },
  { href: '/dashboard/students', label: 'Students', roles: ['admin', 'teacher'] },
  { href: '/dashboard/attendance', label: 'Attendance', roles: ['admin', 'teacher', 'student'] },
  { href: '/dashboard/grades', label: 'Grades', roles: ['admin', 'teacher', 'student'] },
];

const stampClass: Record<Role, string> = {
  admin: 'stamp-admin',
  teacher: 'stamp-teacher',
  student: 'stamp-student',
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between bg-indigo text-paper">
      <div>
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="stamp border-brass text-brass bg-indigo">SE</div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-paper/60">
            Smart Education
          </span>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {items.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-paper/10 text-paper font-medium'
                    : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-paper/10 px-6 py-5">
        <p className="truncate text-sm font-medium">{user.fullName}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className={stampClass[user.role]}>{user.role}</span>
          <button
            onClick={logout}
            className="text-xs text-paper/50 underline hover:text-paper"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
