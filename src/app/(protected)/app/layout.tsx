import Link from 'next/link';
import { FloatingTopChrome, PremiumAvatar, PremiumStatusChip } from '@/components/premium';

import { logoutAction } from '@/server/auth/actions';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { getRequestedPathname } from '@/server/auth/request-path';
import { accountNavItems, workspaceNavItems } from '@/lib/product-ia';

export const dynamic = 'force-dynamic';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthenticatedOnboarded('/app');
  const pathname = await getRequestedPathname('/app');
  const allNavItems = [...workspaceNavItems, ...accountNavItems];

  return (
    <div className="foundation-shell text-white">
      <header className="foundation-topbar">
        <div className="foundation-app-column">
          <FloatingTopChrome
            title="Creator OS"
            subtitle="workspace + account"
            utility={
              <>
                <span className="foundation-search-pill" aria-hidden="true">
                  Search
                </span>
                <Link href="/app/settings" className="foundation-orb-button sm:hidden" aria-label="Open settings">
                  <PremiumAvatar
                    name={session.user.displayName || session.user.email}
                    className="h-11 w-11 border-white/12 bg-white/[0.08] text-[0.72rem] tracking-[0.12em] text-white"
                  />
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="foundation-chip hidden text-[0.7rem] sm:inline-flex">
                    Sign out
                  </button>
                </form>
              </>
            }
            status={
              <>
                <PremiumStatusChip label="Role" value={session.user.role} />
                <PremiumStatusChip
                  label="Now"
                  value={<span className="truncate">{session.user.displayName || session.user.email}</span>}
                  className="max-w-full"
                />
                {session.user.username ? (
                  <PremiumStatusChip label="ID" value={`@${session.user.username}`} />
                ) : null}
              </>
            }
            navigation={
              <nav className="foundation-mobile-nav flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allNavItems.map((item) => {
                  const isActive =
                    item.href === '/app'
                      ? pathname === '/app' || pathname === '/app/'
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
                {session.user.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    className={`foundation-nav-link whitespace-nowrap ${pathname.startsWith('/admin') ? 'foundation-nav-link-active' : ''}`}
                  >
                    Admin
                  </Link>
                ) : null}
              </nav>
            }
          />
        </div>
      </header>

      <div className="foundation-app-column px-4 py-4 sm:max-w-6xl sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="foundation-mobile-shell">
          <aside className="foundation-mobile-sidebar">
            <div className="foundation-sidebar-group">
              <span className="foundation-sidebar-title">Workspace</span>
              {workspaceNavItems.map((item) => {
                const isActive =
                  item.href === '/app'
                    ? pathname === '/app' || pathname === '/app/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`foundation-sidebar-link ${isActive ? 'foundation-sidebar-link-active' : ''}`}
                  >
                    <span className="foundation-sidebar-icon">{item.short}</span>
                    <span className="foundation-sidebar-text">
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="foundation-sidebar-group mt-auto">
              <span className="foundation-sidebar-title">Account</span>
              {accountNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`foundation-sidebar-link ${isActive ? 'foundation-sidebar-link-active' : ''}`}
                  >
                    <span className="foundation-sidebar-icon">{item.short}</span>
                    <span className="foundation-sidebar-text">
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="foundation-shell-main flex min-w-0 flex-col gap-6 sm:gap-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
