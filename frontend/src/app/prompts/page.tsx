"use client";

import { FileText, Plus, Search, Tag, MoreVertical, Copy, Edit2, Play, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useGetPromptsQuery, useCreatePromptMutation, useUpdatePromptMutation, useDeletePromptMutation } from '@/store/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const promptSchema = Yup.object({
  name: Yup.string().required('Required'),
  description: Yup.string(),
  content: Yup.string(),
  tags: Yup.string(),
});

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: rawPrompts, isLoading } = useGetPromptsQuery({});
  
  const [createPrompt, { isLoading: isCreating }] = useCreatePromptMutation();
  const [updatePrompt, { isLoading: isUpdating }] = useUpdatePromptMutation();
  const [deletePrompt] = useDeletePromptMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);

  const prompts = rawPrompts || [];
  const filteredPrompts = prompts.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formik = useFormik({
    initialValues: { name: '', description: '', content: '', tags: '' },
    validationSchema: promptSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const tagArray = values.tags ? values.tags.split(',').map(t => t.trim()) : [];
        const payload = { ...values, tags: tagArray };

        if (editingPrompt) {
          await updatePrompt({ id: editingPrompt.id, ...payload }).unwrap();
        } else {
          await createPrompt(payload).unwrap();
        }
        setIsModalOpen(false);
        setEditingPrompt(null);
        resetForm();
      } catch (err) {
        console.error("Failed to save prompt", err);
      }
    },
  });

  const handleEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    formik.setValues({
      name: prompt.name,
      description: prompt.description || '',
      content: prompt.content || '',
      tags: prompt.tags ? prompt.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPrompt(null);
    formik.resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(id).unwrap();
    }
  };

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[10%] left-[40%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            Prompt Library
          </h1>
          <p className="text-slate-400 text-sm">Manage, version, and share system prompts across your organization</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 w-64 shadow-inner"
            />
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:bg-purple-500 transition">
            <Plus className="w-4 h-4" />
            New Prompt
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredPrompts.map((prompt: any) => (
          <div key={prompt.id} className="glass-card p-6 flex flex-col group hover:border-purple-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{prompt.name}</h3>
              <button className="text-slate-500 hover:text-white transition">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-3">
              {prompt.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {prompt.tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-white/5 text-xs text-slate-300">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                  {prompt.version}
                </span>
                <span className="text-xs text-slate-500">{prompt.updated}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition" title="Copy ID">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleEdit(prompt)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(prompt.id)} className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white transition" title="Test in Playground">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Prompt Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. System Agent v2"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input
                  name="description"
                  type="text"
                  placeholder="Brief description of this prompt"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Content / Template</label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="You are a helpful assistant..."
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
                <input
                  name="tags"
                  type="text"
                  placeholder="system, v2, agent"
                  value={formik.values.tags}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPrompt ? (isUpdating ? 'Saving...' : 'Save Changes') : (isCreating ? 'Creating...' : 'Create Prompt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
