'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/app/stores/authStore';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">TW</span>
            </div>
            <span className="font-bold text-xl dark:text-white">Thapar Watch</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <Link href="/upload" className="hover:text-blue-600 dark:hover:text-blue-400">Upload</Link>
            <Link href="/chat" className="hover:text-blue-600 dark:hover:text-blue-400">Chat</Link>
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy</Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-orange-600 font-semibold hover:text-orange-700">Admin</Link>
                )}
                <span className="text-sm dark:text-gray-300">{user.display_name}</span>
                <button
                  onClick={logout}
                  className="btn btn-primary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary text-sm">Login</Link>
                <Link href="/register" className="btn btn-primary text-sm">Register</Link>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-blue-600">Home</Link>
            <Link href="/upload" className="block py-2 hover:text-blue-600">Upload</Link>
            <Link href="/chat" className="block py-2 hover:text-blue-600">Chat</Link>
            <Link href="/privacy" className="block py-2 hover:text-blue-600">Privacy</Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block py-2 text-orange-600 font-semibold">Admin</Link>
                )}
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full btn btn-primary text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block btn btn-secondary mb-2">Login</Link>
                <Link href="/register" className="block btn btn-primary">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
