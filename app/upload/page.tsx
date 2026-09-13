'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FormData {
  optional_name: string;
  description: string;
  approximate_location: string;
  incident_date: string;
  incident_time: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<FormData>({
    optional_name: '',
    description: '',
    approximate_location: '',
    incident_date: '',
    incident_time: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter((file) => {
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm'];
      if (!validMimes.includes(file.type)) {
        toast.error(`${file.name} is not a supported format`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 100MB)`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setFiles([...files, ...validFiles]);
    toast.success(`${validFiles.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select at least one photo or video');
      return;
    }

    setIsLoading(true);

    try {
      const submitFormData = new FormData();
      files.forEach((file) => {
        submitFormData.append('media', file);
      });
      submitFormData.append('optional_name', formData.optional_name);
      submitFormData.append('description', formData.description);
      submitFormData.append('approximate_location', formData.approximate_location);
      submitFormData.append('incident_date', formData.incident_date);
      submitFormData.append('incident_time', formData.incident_time);

      const response = await axios.post(`${API_URL}/reports/submit`, submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Submission received! Thank you for your report.');
      setFiles([]);
      setFormData({
        optional_name: '',
        description: '',
        approximate_location: '',
        incident_date: '',
        incident_time: '',
      });
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-2 dark:text-white">Submit Media</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Share your photos or videos securely and privately</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold mb-2 dark:text-white">Drag and drop your media here</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">or</p>
                  <label className="btn btn-primary inline-block cursor-pointer">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Supported formats: JPEG, PNG, WebP, HEIC, MP4, MOV, WebM (Max 100MB per file, 5 files total)
                  </p>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Selected Files ({files.length}/5)</h3>
                    <div className="space-y-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold truncate dark:text-white">{file.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="card space-y-4">
                  <h3 className="text-lg font-bold dark:text-white">Additional Information (Optional)</h3>

                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Your Name</label>
                    <input
                      type="text"
                      value={formData.optional_name}
                      onChange={(e) => setFormData({ ...formData, optional_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder="Optional - remain anonymous if you prefer"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder="What happened? Provide context..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Approximate Location on Campus</label>
                    <input
                      type="text"
                      value={formData.approximate_location}
                      onChange={(e) => setFormData({ ...formData, approximate_location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder="e.g., Near the main gate, Library area"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Date of Incident</label>
                      <input
                        type="date"
                        value={formData.incident_date}
                        onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Time of Incident</label>
                      <input
                        type="time"
                        value={formData.incident_time}
                        onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>🔒 Your privacy is protected:</strong> Your name is optional. Only administrators can access your submission. Your media is stored securely and privately.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || files.length === 0}
                  className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
