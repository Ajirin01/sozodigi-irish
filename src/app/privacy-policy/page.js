import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-8 sm:p-10 lg:p-12 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-primary-7 mb-6 text-center">Privacy Policy</h1>

        <p className="text-base text-gray-700 mb-6">
          At Sozo Digicare, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our services. By accessing or using our services, you agree to the terms of this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">1. Information We Collect</h2>
        <h3 className="font-semibold mb-2">1.1 Personal Information</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700 pl-4">
          <li>Name</li>
          <li>Date of Birth</li>
          <li>Contact Information (email address, phone number, address)</li>
          <li>Medical History and Health Information</li>
          <li>Payment Information (credit/debit card details)</li>
          <li>Login Credentials (username, password)</li>
        </ul>

        <h3 className="font-semibold mb-2">1.2 Non-Personal Information</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700 pl-4">
          <li>Device Information (IP address, browser type, operating system)</li>
          <li>Usage Data (pages visited, time spent on the website, clickstream data)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 pl-4">
          <li>Providing Services such as consultations and health information</li>
          <li>Managing Appointments</li>
          <li>Communication regarding services and updates</li>
          <li>Payment Processing</li>
          <li>Personalization and Improvement of our platform</li>
          <li>Compliance with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">3. How We Share Your Information</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 pl-4">
          <li>Service Providers for processing and customer support</li>
          <li>Healthcare Professionals for care coordination</li>
          <li>Legal Authorities when required by law</li>
          <li>Business Transfers such as mergers and acquisitions</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">4. Data Security</h2>
        <p className="text-gray-700 mb-6">
          We implement industry-standard measures including encryption, secure servers, and access controls to protect your personal data. However, we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">5. Data Retention</h2>
        <p className="text-gray-700 mb-6">
          We retain your personal information only as long as necessary for the intended purpose or legal compliance. We securely delete or anonymize data when no longer needed.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">6. Your Rights</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 pl-4">
          <li>Access and receive a copy of your data</li>
          <li>Correct or update your data</li>
          <li>Request deletion under certain circumstances</li>
          <li>Restrict or object to certain processing</li>
          <li>Request data portability</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">7. Cookies and Tracking</h2>
        <p className="text-gray-700 mb-6">
          We use cookies to improve functionality and analyze usage. You can control cookies through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">8. Third-Party Links</h2>
        <p className="text-gray-700 mb-6">
          We are not responsible for the privacy practices of third-party websites. Please review their policies independently.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">9. Children’s Privacy</h2>
        <p className="text-gray-700 mb-6">
          Our services are not intended for individuals under 18. We do not knowingly collect data from children.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">10. Changes to This Policy</h2>
        <p className="text-gray-700 mb-6">
          We may update this policy periodically. Continued use of our services after changes means you accept the updated terms.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-4">11. Contact Us</h2>
        <p className="text-gray-700 mb-6">
          If you have questions or concerns about our privacy practices, contact us at:
          <br /> <strong>Email:</strong> contact@SozoDigicare.ie
        </p>

        <p className="text-sm text-gray-500 text-right">Effective Date: May 2025</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
