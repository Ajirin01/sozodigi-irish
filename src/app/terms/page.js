import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-8 sm:p-10 lg:p-12 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-primary-7 mb-6 text-center">Terms and Conditions</h1>

        <section className="text-gray-700 text-base space-y-6">
          <p>Welcome to Sozo Digicare Limited (A Global Web Hospital, Health and Care Services). These Terms and Conditions govern your use of our website and services. By accessing or using our services, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, please do not use our services.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">1. Definitions</h2>
          <p><strong>Sozo Digicare Limited</strong> is a global web hospital offering health and care related services. <strong>USER</strong> refers to any individual or entity using our services. <strong>Sozo Digicare</strong> refers to Sozo Digicare Limited and its operators.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">2. Acceptance of Terms</h2>
          <p>By using our services, you confirm that you accept these Terms and agree to comply with them. If you do not agree to these Terms, you must not use our services.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">3. Services</h2>
          <p>Sozo Digicare provides online medical consultations, health and care, and related services. Our services are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of another physician or qualified health provider with any questions you may have regarding a medical condition.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">4. Use of Services</h2>
          <p><strong>4.1 Eligibility:</strong> To use our services, you must be at least 18 years old.</p>
          <p><strong>4.2 Registration:</strong> You agree to provide accurate, current, and complete information during the registration process.</p>
          <p><strong>4.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your account information.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">5. User Responsibilities</h2>
          <p><strong>Prohibited Conduct:</strong> Do not use our services unlawfully, impersonate others, or disrupt our services.</p>
          <p><strong>Device Requirements:</strong> Ensure your device/network supports consultations. The company is not liable for connection failures.</p>

          <h3 className="text-xl font-semibold mt-4">System Requirements</h3>
          <ul className="list-disc pl-6">
            <li>Windows 10 / macOS High Sierra or later</li>
            <li>Intel Core i5 / AMD equivalent</li>
            <li>8 GB RAM, 256 GB storage</li>
            <li>720p webcam, noise-cancelling mic and headphones</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4">Internet Requirements</h3>
          <ul className="list-disc pl-6">
            <li>5 Mbps upload (10 Mbps recommended)</li>
            <li>{`Latency < 50 ms, Jitter < 20 ms, Packet loss < 1%`}</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4">Browser Requirements</h3>
          <ul className="list-disc pl-6">
            <li>Latest Chrome, Firefox, or Edge</li>
            <li>No extensions that interfere with video calls</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4">Environment</h3>
          <ul className="list-disc pl-6">
            <li>Quiet workspace, good lighting, reliable power source</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">6. Privacy</h2>
          <p>See our Privacy Policy for details on how we collect, use, and disclose information.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">7. Intellectual Property</h2>
          <p>All content and trademarks are the property of Sozo Digicare or their respective owners.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">8. Limitation of Liability</h2>
          <p>Sozo Digicare is not liable for indirect or consequential damages, including data loss or service interruption.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">9. Indemnification</h2>
          <p>You agree to indemnify Sozo Digicare from any claims arising from your use of our services or violation of the Terms.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">10. Termination</h2>
          <p>We may terminate your access if you violate these Terms. All rights will cease immediately upon termination.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">11. Changes to Terms</h2>
          <p>We may update these Terms at any time. Material changes will be notified 30 days in advance.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">12. Governing Law</h2>
          <p>These Terms are governed by the laws of Ireland.</p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">13. Contact</h2>
          <p>Contact us at: <a href="mailto:contact@SozoDigicare.ie" className="text-blue-600 underline">contact@SozoDigicare.ie</a></p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)]">14. Entire Agreement</h2>
          <p>These Terms constitute the full agreement between you and Sozo Digicare regarding our services.</p>

          <p className="text-sm text-gray-500 mt-8 text-center">By using our services, you acknowledge that you have read, understood, and agree to these Terms and Conditions.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
