import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-gray-400">
        Auth is currently removed from the BETALENT foundation. This route stays as a
        placeholder shell for future account and application settings.
      </p>

      <div className="rounded-lg bg-gray-800 p-5">
        <p className="text-sm text-gray-400">Current state</p>
        <p className="mt-2 text-xl font-semibold">
          Public-only deploy
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-5 text-sm text-gray-300">
        No auth provider is wired right now. BETALENT app-specific profile fields will live under{' '}
        <Link className="text-red-400 hover:text-red-300" href="/app/profile">
          /app/profile
        </Link>.
      </div>
    </div>
  );
}
