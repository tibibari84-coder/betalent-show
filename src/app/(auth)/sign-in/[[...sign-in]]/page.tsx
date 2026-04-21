import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-3xl font-bold">Sign-in Disabled</h1>
        <p className="mt-4 text-gray-300">
          The current BETALENT foundation is intentionally public-only. No auth
          provider is wired in this deployable baseline yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          Back to landing page
        </Link>
      </div>
    </div>
  );
}
