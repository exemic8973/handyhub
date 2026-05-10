import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
            <p>Last updated: May 2026</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using HandyHub, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">2. Description of Service</h2>
            <p>HandyHub is a platform that connects customers with independent handyman professionals. We do not employ handymen and are not responsible for the quality of work performed.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account and keep it up to date.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Bookings and Payments</h2>
            <p>All bookings are subject to availability. Prices are estimates and may vary based on actual work performed. HandyHub facilitates connections but does not process payments directly at this time.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Cancellations</h2>
            <p>Customers may cancel bookings through the platform. Repeated cancellations may result in account restrictions. Handymen may also cancel with appropriate notice.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Limitation of Liability</h2>
            <p>HandyHub is provided &ldquo;as is&rdquo; without warranties. We are not liable for damages arising from the use of our platform or services booked through it.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Contact</h2>
            <p>For questions about these terms, contact us at support@handyhub.com.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
