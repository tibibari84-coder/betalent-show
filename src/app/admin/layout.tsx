export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 p-4">
        <nav className="flex justify-between items-center">
          <h1 className="text-xl font-bold">BETALENT Admin</h1>
          <div className="space-x-4">
            <a href="/admin" className="hover:text-red-400">Dashboard</a>
            <a href="/admin/submissions" className="hover:text-red-400">Submissions</a>
            <a href="/admin/seasons" className="hover:text-red-400">Seasons</a>
          </div>
        </nav>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
