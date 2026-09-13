'use client';

import { useEffect, useState, useRef } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/app/stores/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Send, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ChatMessage {
  id: number;
  sender_id: number;
  user_id: string;
  display_name: string;
  message_text: string;
  created_at: string;
}

interface ChatStatus {
  is_open: boolean;
  open_time: string;
  close_time: string;
  timezone: string;
}

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat status
  const fetchChatStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/status`);
      setChatStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch chat status:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchChatStatus();
    fetchMessages();

    // Poll for new messages every 2 seconds
    pollIntervalRef.current = setInterval(fetchMessages, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (!chatStatus?.is_open) {
      toast.error('Chat is currently closed. Hours: 10 PM to 4 AM IST');
      return;
    }

    setIsSending(true);

    try {
      await axios.post(
        `${API_URL}/chat/messages`,
        { message_text: messageInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageInput('');
      await fetchMessages();
      toast.success('Message sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg dark:text-gray-300">Loading chat...</p>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-gray-700">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Community Chatroom</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.display_name}!</p>
              </div>
              <motion.div
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  chatStatus?.is_open
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {chatStatus?.is_open ? 'Chat Open' : 'Chat Closed'}
              </motion.div>
            </div>
          </div>

          {/* Chat Status Info */}
          {!chatStatus?.is_open && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
              <div className="container mx-auto flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
                <Clock size={20} />
                <p>
                  Chat is open daily from <strong>{chatStatus?.open_time}</strong> to <strong>{chatStatus?.close_time}</strong> IST.
                </p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto container mx-auto w-full py-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      {msg.sender_id !== user?.id && (
                        <p className="text-xs font-bold mb-1 opacity-75">{msg.display_name}</p>
                      )}
                      <p className="break-words">{msg.message_text}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-slate-800 border-t dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="container mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={chatStatus?.is_open ? 'Type a message...' : 'Chat is closed'}
                  disabled={!chatStatus?.is_open || isSending}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatStatus?.is_open || isSending}
                  className="btn btn-primary px-6 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
