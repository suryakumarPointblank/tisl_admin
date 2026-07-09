'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BookOpen,
  FileText,
  UserCheck,
  Activity,
  Heart,
  Video,
  LogOut,
  MessageSquare,
  ClipboardList,
  Presentation,
  CalendarCheck,
  GraduationCap,
  UserPlus,
  BarChart2,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/therapy-areas', label: 'Therapy Areas', icon: Stethoscope },
  { href: '/sub-sections', label: 'Sub-sections', icon: BookOpen },
  { href: '/topics', label: 'Topics', icon: FileText },
  { href: '/content-items', label: 'Content Items', icon: FileText },
  { href: '/faculty', label: 'Faculty', icon: UserCheck },
  { href: '/conditions', label: 'Conditions', icon: Activity },
  { href: '/patient-content', label: 'Patient Content', icon: Heart },
  { href: '/webinars', label: 'Webinars', icon: Video },
  { href: '/engagement', label: 'Engagement', icon: BarChart2 },
  { href: '/contact-inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/case-submissions', label: 'Case Submissions', icon: ClipboardList },
  { href: '/slide-deck-requests', label: 'Slide Decks', icon: Presentation },
  { href: '/webinar-registrations', label: 'Webinar Regs', icon: CalendarCheck },
  { href: '/training-programs', label: 'Training Programs', icon: GraduationCap },
  { href: '/training-program-registrations', label: 'TP Registrations', icon: UserPlus },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    deleteCookie('authToken', { path: '/' });
    deleteCookie('refreshToken', { path: '/' });
    router.replace('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <span className="text-sm font-semibold text-gray-900">TISL Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-500 hover:text-gray-900"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
