import Link from 'next/link';

import { FloatingTopChrome, PremiumStatusChip } from '@/components/premium';
import { logoutAction } from '@/server/auth/actions';
import { getAdminAccess } from '@/server/auth/guard';
import { getRequestedPathname } from '@/server/auth/request-path';

export const dynamic = 'force-dynamic';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/submissions', label: 'Review Queue' },
  { href: '/admin/seasons', label: 'Seasons' },
  { href: '/admin/stages', label: 'Stages' },
  { href: '/admin/episodes', label: 'Episodes' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess('/admin');
  const pathname = await getRequestedPathname('/admin');

  if (!access.allowed) {
    return (
      <div className="foundation-shell flex min-h-screen items-center justify-center px-6 text-white">
        <div className="foundation-panel max-w-xl rounded-[1.75rem] p-8 text-center">
          <p className="foundation-kicker">BETALENT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.12em] text-white">
            FORBIDDEN
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/66">
            Your account is authenticated, but admin access is reserved for BETALENT operators.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className="foundation-nav-link">
              Return to app
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="foundation-nav-link">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const { session } = access;

  return (
    <div className="foundation-shell min-h-screen text-white">
      <header className="foundation-topbar">
        <div className="foundation-app-column">
          <FloatingTopChrome
            title="Admin Control"
            subtitle="show operations + publishing guardrails"
            utility={
              <>
                <Link href="/app" className="foundation-chip text-[0.7rem]">
                  Creator app
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="foundation-chip text-[0.7rem]">
                    Sign out
                  </button>
                </form>
              </>
            }
            status={
              <>
                <PremiumStatusChip label="Operator" value={session.user.displayName || session.user.email} />
                <PremiumStatusChip label="Role" value={session.user.role} />
              </>
            }
            navigation={
              <nav className="flex flex-wrap gap-2">
                {adminNavItems.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin' || pathname === '/admin/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`foundation-nav-link whitespace-nowrap ${isActive ? 'foundation-nav-link-active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            }
          />
        </div>
      </header>

      <main className="foundation-app-column px-4 py-6 sm:max-w-6xl sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
