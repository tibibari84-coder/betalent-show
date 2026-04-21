import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="foundation-shell text-white">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07070b]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="foundation-kicker">BETALENT</p>
              <h1 className="mt-1 text-xl font-semibold tracking-[0.18em] text-white sm:text-2xl">
                FOUNDATION
              </h1>
            </div>
            <div className="foundation-panel rounded-full px-4 py-2 text-xs font-medium text-white/70">
              Public-first cinematic baseline
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link href="/app" className="foundation-nav-link">Overview</Link>
            <Link href="/app/profile" className="foundation-nav-link">Profile</Link>
            <Link href="/app/uploads" className="foundation-nav-link">Uploads</Link>
            <Link href="/app/submissions" className="foundation-nav-link">Submissions</Link>
            <Link href="/app/seasons" className="foundation-nav-link">Seasons</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
