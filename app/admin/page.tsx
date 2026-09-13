'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="py-12 px-4">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Manage Reports',
                  description: 'Review, update, and manage all submitted media reports',
                  href: '/admin/reports',
                  color: 'blue',
                },
                {
                  title: 'Manage Chat',
                  description: 'Monitor, moderate, and manage the community chatroom',
                  href: '/admin/chat',
                  color: 'green',
                },
                {
                  title: 'Manage Users',
                  description: 'View all users and manage account statuses',
                  href: '/admin/users',
                  color: 'purple',
                },
                {
                  title: 'Audit Logs',
                  description: 'View all administrative actions and audit history',
                  href: '/admin/logs',
                  color: 'orange',
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className={`card hover:shadow-2xl cursor-pointer`}
                >
                  <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg mb-4`}></div>
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">{item.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
