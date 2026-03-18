import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — KChime',
  description: 'How KChime handles your data. No message storage, secure processing, user-controlled inputs.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link href="/" className="text-sm text-teal-600 hover:underline font-medium">
          &larr; Back to KChime
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
            <p>
              KChime is an AI reply assistant. We are committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">No message storage</h2>
            <p>
              Messages you paste or speak into KChime are processed in real time to generate reply suggestions. We do not store, log, or retain the content of your messages after processing is complete.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Secure processing</h2>
            <p>
              All data transmitted between your device and our servers is encrypted using TLS. We use industry-standard security practices to protect your information during processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">User-controlled inputs</h2>
            <p>
              KChime only processes the messages you explicitly share with the app. We do not read, scan, or access any messages or data on your device beyond what you provide.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Account data</h2>
            <p>
              If you create an account, we store your email address and subscription status. This data is used solely for authentication and billing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@kchime.app" className="text-teal-600 hover:underline">
                privacy@kchime.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
