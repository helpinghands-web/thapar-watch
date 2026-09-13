'use client';

import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {children}
      </main>
      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Thapar Watch</h3>
              <p className="text-gray-400">Your campus. Your voice. Your responsibility.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/upload" className="hover:text-white">Upload Media</a></li>
                <li><a href="/chat" className="hover:text-white">Community Chat</a></li>
                <li><a href="/how-it-works" className="hover:text-white">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Use</a></li>
                <li><a href="/guidelines" className="hover:text-white">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: admin@thaparwatch.local</li>
                <li>Status: Online</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Thapar Watch. All rights reserved.</p>
            <p className="text-sm mt-2">This platform is independent and not officially affiliated with Thapar Institute unless formal authorization is obtained.</p>
          </div>
        </div>
      </footer>
      <Toaster position="top-right" />
    </>
  );
}
