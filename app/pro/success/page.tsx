import Link from 'next/link';

export const metadata = {
  title: 'You\'re Pro! — KChime',
};

export default function ProSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
          <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">You&apos;re Pro!</h1>
        <p className="text-gray-500 text-lg mb-8">
          Your subscription is active. You now have access to all Pro features.
        </p>

        <Link
          href="/reply"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-sm font-semibold text-white hover:bg-indigo-700 transition mb-4"
        >
          Start using KChime Pro
        </Link>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            Back to KChime
          </Link>
        </div>
      </div>
    </div>
  );
}
