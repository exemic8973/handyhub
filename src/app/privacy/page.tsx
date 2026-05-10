import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
            <p>Last updated: May 2026</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, including your name, email address, phone number, and location data. We also collect booking history and review data.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">2. How We Use Information</h2>
            <p>Your information is used to provide and improve our services, facilitate bookings between customers and handymen, send notifications about your bookings, and ensure platform safety.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Information Sharing</h2>
            <p>We share relevant information between customers and handymen to facilitate bookings. We do not sell your personal data to third parties. We may share data with service providers who help operate our platform.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. Passwords are hashed using industry-standard encryption. However, no online service is 100% secure.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Your Rights</h2>
            <p>You may access, update, or delete your account information at any time through your dashboard settings. You may also request a copy of your data by contacting support.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Cookies</h2>
            <p>We use essential cookies for authentication and security purposes. We do not use tracking cookies or third-party analytics cookies.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Contact</h2>
            <p>For privacy-related questions, contact us at support@handyhub.com.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
