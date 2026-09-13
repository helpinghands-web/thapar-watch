'use client';

import Layout from '@/components/Layout';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-8 dark:text-white">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">What Information Do We Collect?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  When you submit a report, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Optional Name (if provided)</li>
                  <li>Uploaded media (photos/videos)</li>
                  <li>Optional description of the incident</li>
                  <li>Optional approximate location on campus</li>
                  <li>Optional date and time of the incident</li>
                  <li>Submission timestamp</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">What We Do NOT Require</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We do not require:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Student ID or roll number</li>
                  <li>Home address</li>
                  <li>Social media profiles</li>
                  <li>Government-issued ID</li>
                  <li>Any form of identity verification</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">How We Store Your Media</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  All uploaded media is stored securely in private storage with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Access-controlled URLs that are not publicly accessible</li>
                  <li>Encryption at rest and in transit</li>
                  <li>Access restricted to authorized administrators only</li>
                  <li>No automatic public indexing or display</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Who Can Access Your Submission?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Only authorized administrators can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>View your submitted media</li>
                  <li>Access your optional name (if provided)</li>
                  <li>Read your description and location information</li>
                  <li>Download or review your submission</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your submission is NOT visible to other users, the public, or any unauthorized persons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Data Retention</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We retain submitted reports and media for as long as necessary for administrative review and action. You may request removal of your content by contacting the administrator, subject to legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Important Limitations</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  While we prioritize your privacy, please note:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Hosting providers and server logs may contain limited technical records</li>
                  <li>Legal obligations may require disclosure in certain circumstances</li>
                  <li>We cannot guarantee complete anonymity in all scenarios</li>
                  <li>This platform is independent and not officially affiliated with Thapar Institute</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Community Chat Privacy</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  In the community chat:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Messages are displayed with your chosen display name only</li>
                  <li>Avoid sharing personal information, passwords, or sensitive details</li>
                  <li>Administrators can moderate messages for safety</li>
                  <li>Messages are retained according to our message retention policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For privacy questions or concerns, please contact the platform administrator at: admin@thaparwatch.local
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
