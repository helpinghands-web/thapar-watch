'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, token } = useAuthStore();
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    password_confirm: '',
    display_name: '',
  });

  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !formData.password || !formData.display_name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register(
        formData.user_id,
        formData.password,
        formData.password_confirm,
        formData.display_name
      );
      toast.success('Registration successful!');
      router.push('/chat');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Join the Thaparians community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">User ID *</label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Choose a unique User ID"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Display Name *</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Your display name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="At least 8 characters"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Confirm Password *</label>
              <input
                type="password"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2 text-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </a>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
