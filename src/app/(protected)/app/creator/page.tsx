export default function CreatorPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Creator Tools</h1>
      <p className="text-gray-400">
        BETALENT ships a public-only foundation first. Creator tooling remains as a stable shell
        route while auth and account-aware workflows are intentionally offline.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Role</p>
          <p className="mt-2 text-xl font-semibold">Public visitor</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Creator Profile</p>
          <p className="mt-2 text-xl font-semibold">Not active</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Recommended next step</p>
          <p className="mt-2 text-xl font-semibold">Review the public foundation</p>
        </div>
      </div>
    </div>
  );
}
