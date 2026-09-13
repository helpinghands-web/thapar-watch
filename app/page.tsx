'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/app/stores/authStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, Eye, Lock, Zap, Users } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Thapar Watch
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-4 opacity-90"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            See it. Record it. Report it.
          </motion.p>
          <motion.p
            className="text-lg opacity-80 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            Your campus. Your voice. Your responsibility.
          </motion.p>
          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/upload"
              className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Upload Media
            </Link>
            <Link
              href="/chat"
              className="btn bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-3 border-2 border-white"
            >
              Enter Community Chat
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Why Thapar Watch?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="w-12 h-12 text-blue-600" />,
                title: 'Easy Uploads',
                description: 'Submit photos and videos directly from your device, camera, or cloud storage in seconds.',
              },
              {
                icon: <Lock className="w-12 h-12 text-green-600" />,
                title: 'Complete Privacy',
                description: 'Optional name submission. No email, phone, or ID required. Uploaded media is private by default.',
              },
              {
                icon: <Eye className="w-12 h-12 text-purple-600" />,
                title: 'Secure Review',
                description: 'Only authorized administrators can view, manage, and download your submissions privately.',
              },
              {
                icon: <MessageSquare className="w-12 h-12 text-orange-600" />,
                title: 'Community Chat',
                description: 'Connect with Thaparians nightly (10 PM - 4 AM IST) in a moderated community chatroom.',
              },
              {
                icon: <Zap className="w-12 h-12 text-yellow-600" />,
                title: 'Fast & Responsive',
                description: 'Beautiful interface optimized for mobile, tablet, and desktop devices.',
              },
              {
                icon: <Users className="w-12 h-12 text-red-600" />,
                title: 'Safe Community',
                description: 'Responsible reporting platform with clear guidelines against harassment and bullying.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="card"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: idx * 0.1 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-slate-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Capture or Select',
                description: 'Record a video, take a photo, or choose media from your device or cloud storage.',
              },
              {
                number: '2',
                title: 'Submit Information',
                description: 'Optionally provide your name, description, location, and timing. No personal details required.',
              },
              {
                number: '3',
                title: 'Admin Reviews',
                description: 'The administrator receives your submission privately and determines appropriate next steps.',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Safety Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Privacy & Safety</h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">🔐 Your Privacy Matters</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You can submit a report without providing your name or any contact details. We do not automatically collect or display:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Email addresses</li>
                <li>Phone numbers</li>
                <li>Student IDs or roll numbers</li>
                <li>Social media profiles</li>
                <li>Exact device information</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">⚠️ Important Disclaimer</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>This platform is not an emergency service.</strong> If someone is in immediate danger, contact campus security or appropriate emergency services directly.
              </p>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">🤝 Responsible Reporting</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thapar Watch is designed for genuine reporting of campus concerns, not for harassment, bullying, or public shaming.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Do not submit false or fabricated content</li>
                <li>Do not share private information to identify or expose individuals</li>
                <li>Do not record people in private situations without consent</li>
                <li>Do not encourage vigilantism or confrontation</li>
                <li>Respect the privacy and dignity of all campus members</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Share Your Story?</h2>
          <p className="text-lg mb-8 opacity-90">Submit your photos and videos securely. It takes just a few seconds.</p>
          <Link
            href="/upload"
            className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 inline-block"
          >
            Upload Now
          </Link>
        </div>
      </section>
    </Layout>
  );
}
