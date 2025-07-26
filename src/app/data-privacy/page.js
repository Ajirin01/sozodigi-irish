'use client';

import React from 'react';

const DataPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-8 sm:p-10 lg:p-12 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-primary-7 mb-6 text-center">
          Sozo Digicare Data Policy
        </h1>

        <section className="text-base text-gray-600 leading-relaxed space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">1. Introduction</h2>
            <p>
              Sozo Digicare is committed to protecting the privacy and security of our users and their data.
              This policy outlines how we collect, store, and use personal data in compliance with GDPR and HIPAA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">2. Data Collection</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li><strong>Personal Identification Information (PII):</strong> Name, address, date of birth, email, phone, SSN.</li>
              <li><strong>Medical Information:</strong> Health history, treatment records, prescriptions, lab results.</li>
              <li><strong>Financial Information:</strong> Insurance details, billing info, payment history.</li>
              <li><strong>Technical Data:</strong> IP address, browser, device info, usage data.</li>
            </ul>
            <p className="mt-4">
              Data is collected through registration forms, consultations, EHR integrations, cookies, and tracking technologies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">3. Data Storage</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li><strong>Storage Locations:</strong> Secure, compliant data centers and cloud services.</li>
              <li><strong>Security Measures:</strong> AES-256 encryption, role-based access, regular audits, backups.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">4. Data Usage</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Providing and improving medical care</li>
              <li>Communicating with patients</li>
              <li>Processing billing and insurance claims</li>
              <li>Analyzing service usage and improving offerings</li>
              <li>Meeting legal and regulatory requirements</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">4.2 Data Sharing</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Healthcare providers for coordinated care</li>
              <li>Insurance companies for claims processing</li>
              <li>Legal authorities if required by law</li>
              <li>Authorized service providers under confidentiality</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">4.3 User Rights</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li><strong>Access:</strong> View your personal data</li>
              <li><strong>Correction:</strong> Fix incorrect/incomplete data</li>
              <li><strong>Deletion:</strong> Request removal, where legally applicable</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Portability:</strong> Transfer data to another provider</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">5. Data Retention</h2>
            <p>
              We retain data only as long as necessary for service delivery and legal compliance. When no longer needed,
              data is securely deleted or anonymized.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">6. Policy Updates</h2>
            <p>
              This policy may be updated to reflect changes in our practices or regulations. We'll notify users of
              significant changes via our website or direct communication.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mb-2">7. Contact Information</h2>
            <p>
              If you have any questions or concerns, please contact us at: <br />
              <a href="mailto:contact@SozoDigicare.ie" className="text-[var(--color-primary-6)] underline">
                contact@SozoDigicare.ie
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataPolicy;
