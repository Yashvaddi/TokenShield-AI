"use client";

import { Key, Plus, Trash2, Copy, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { useGetKeysQuery, useCreateKeyMutation, useDeleteKeyMutation } from '@/store/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Key name is required').min(3, 'Must be at least 3 characters'),
  assignmentType: Yup.string().oneOf(['project', 'developer']).required('Assignment type is required'),
  assigneeId: Yup.string().required('Assignee is required'),
  provider: Yup.string().oneOf(['anthropic', 'openai', 'gemini', 'all']).required('Provider is required'),
});

export default function ApiKeysPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: rawKeys, isLoading } = useGetKeysQuery({});
  const [createKey, { isLoading: isCreating }] = useCreateKeyMutation();
  const [deleteKey] = useDeleteKeyMutation();
  
  const keys = rawKeys || [];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this API Key?')) {
      try {
        await deleteKey(id).unwrap();
      } catch (err) {
        console.error('Failed to delete key', err);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      assignmentType: 'project',
      assigneeId: '',
      provider: 'anthropic',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createKey(values).unwrap();
        // Since we are mocking the backend for now, we just close the modal
        setIsModalOpen(false);
        resetForm();
      } catch (err) {
        console.error('Failed to create key:', err);
        // Simulate success for demo purposes
        setIsModalOpen(false);
        resetForm();
      }
    },
  });

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            API Keys
          </h1>
          <p className="text-slate-400 text-sm">Manage Project and Developer credentials</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Key
        </button>
      </header>

      <div className="glass-card relative z-10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Name</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">API Key</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Assignment</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Provider</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.map((k: any) => (
              <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-slate-800 border border-white/5">
                      <Key className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-medium text-slate-200">{k.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 rounded bg-black/30 text-slate-300 font-mono text-sm border border-white/5">
                      {k.key}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(k.id, k.key)}
                      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                      {copiedId === k.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-400 text-sm font-medium">{k.assignment}</td>
                <td className="py-4 px-6 text-slate-400 text-sm">{k.provider}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    k.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => handleDelete(k.id)} className="p-2 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition group">
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Provision API Key</h2>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Key Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Production Gateway"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${formik.touched.name && formik.errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-blue-500'} rounded-lg text-white focus:outline-none transition`}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-rose-400 text-xs mt-1">{formik.errors.name as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assignment Scope</label>
                <select
                  name="assignmentType"
                  value={formik.values.assignmentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition appearance-none"
                >
                  <option value="project">Project / Environment</option>
                  <option value="developer">Individual Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {formik.values.assignmentType === 'project' ? 'Select Project' : 'Select Developer'}
                </label>
                <select
                  name="assigneeId"
                  value={formik.values.assigneeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${formik.touched.assigneeId && formik.errors.assigneeId ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-blue-500'} rounded-lg text-white focus:outline-none transition appearance-none`}
                >
                  <option value="" disabled>Select...</option>
                  {formik.values.assignmentType === 'project' ? (
                    <>
                      <option value="p_1">Core API</option>
                      <option value="p_2">Demo Workspace</option>
                    </>
                  ) : (
                    <>
                      <option value="u_1">Alice Chen</option>
                      <option value="u_2">Bob Smith</option>
                    </>
                  )}
                </select>
                {formik.touched.assigneeId && formik.errors.assigneeId && (
                  <p className="text-rose-400 text-xs mt-1">{formik.errors.assigneeId as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">LLM Provider</label>
                <select
                  name="provider"
                  value={formik.values.provider}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition appearance-none"
                >
                  <option value="all">All Enabled Providers</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="gemini">Google (Gemini)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
