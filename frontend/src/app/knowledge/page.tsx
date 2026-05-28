"use client";

import { Database, UploadCloud, FileText, File, MoreVertical, Search, CheckCircle2, AlertCircle, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useGetKnowledgeFilesQuery, useUploadKnowledgeMutation, useDeleteKnowledgeMutation } from '@/store/apiSlice';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: rawFiles, isLoading } = useGetKnowledgeFilesQuery({});
  const [uploadKnowledge] = useUploadKnowledgeMutation();
  const [deleteKnowledge] = useDeleteKnowledgeMutation();
  
  const files = rawFiles || [];
  const filteredFiles = files.filter((f: any) => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        await uploadKnowledge({
          name: file.name,
          type: file.type || 'Unknown Document',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
        }).unwrap();
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this file from the Knowledge Base?")) {
      await deleteKnowledge(id).unwrap();
    }
  };

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            Knowledge Base (RAG)
          </h1>
          <p className="text-slate-400 text-sm">Upload documents to expand your AI's context and custom knowledge</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Upload Area */}
        <div className="lg:col-span-1">
          <div 
            className={`glass-card p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center h-64 ${
              isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-black/20 hover:border-blue-400/50 hover:bg-white/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Document</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-[220px]">Drag & drop PDF, CSV, DOCX, Audio or Video files here for multimodal indexing</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
              accept=".pdf,.csv,.docx,.txt"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Select Files'}
            </button>
          </div>

          <div className="mt-6 glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Vector Store Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Storage Used</span>
                  <span className="text-blue-400 font-mono">1.2 GB / 5.0 GB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Documents</span>
                <span className="text-white font-medium">1,204</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Vectors</span>
                <span className="text-white font-medium">45,209</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Embedding Model</span>
                <span className="text-indigo-400 font-mono text-xs">text-embedding-3-large</span>
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="glass-card p-0 lg:col-span-2 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Document Library
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-64 shadow-inner"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">File Name</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Size</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Uploaded</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFiles.map((file: any) => (
                  <tr key={file.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-slate-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{file.name}</span>
                          <span className="text-xs text-slate-500">{file.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-mono">
                      {file.size}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {file.uploadedAt}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {file.status === 'Indexed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                        )}
                        <span className={`text-sm ${file.status === 'Indexed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {file.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete(file.id)} className="p-2 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RAG Sandbox */}
      <div className="glass-card mt-8 relative z-10 p-6 flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Semantic Search & RAG Sandbox
        </h2>
        <p className="text-sm text-slate-400 mb-6">Test how your custom knowledge is retrieved before deploying it to your AI agents or chat interfaces.</p>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Ask a question about your uploaded documents (e.g. 'What is our PTO policy?')..."
              className="w-full bg-black/40 border border-indigo-500/30 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition"
            />
          </div>
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition">
            Test Query
          </button>
        </div>
        
        {/* Mock Results Area */}
        <div className="mt-8 border border-white/5 rounded-xl bg-black/30 p-6 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-4">Retrieved Context (Top K = 2)</h3>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 text-sm text-slate-300">
                <span className="text-xs text-indigo-400 font-mono block mb-2 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> employee_handbook_2024.pdf (Similarity Score: 0.92)
                </span>
                "All enterprise employees are entitled to 20 days of paid time off per calendar year, accrued monthly. Unused PTO rolls over up to a maximum of 30 days..."
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 text-sm text-slate-300">
                <span className="text-xs text-indigo-400 font-mono block mb-2 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> HR_Policies_v2.docx (Similarity Score: 0.85)
                </span>
                "In addition to standard PTO, team members receive 5 paid sick days and 2 mental health days per quarter. Requests must be logged in the HR portal..."
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> AI Synthesized Answer
              </span>
              <p className="text-sm text-white leading-relaxed">
                Based on the retrieved documents, enterprise employees receive 20 days of paid time off (PTO) annually. Additionally, you are provided with 5 sick days and 2 mental health days each quarter. Any unused PTO can be rolled over to the next year, capped at 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
