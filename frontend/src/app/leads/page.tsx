"use client";

import { Users, Mail, Building, Clock, CheckCircle2, ChevronRight, Inbox, Trash2, Edit2, Plus, X } from 'lucide-react';
import { useGetLeadsQuery, useUpdateLeadMutation, useDeleteLeadMutation, useCreateLeadMutation } from '@/store/apiSlice';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const leadSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  company: Yup.string().required('Required'),
  status: Yup.string(),
});

export default function LeadsPage() {
  const { data: rawLeads, isLoading } = useGetLeadsQuery({});
  const leads = rawLeads || [];
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();

  const formik = useFormik({
    initialValues: { name: '', email: '', company: '', status: 'New' },
    validationSchema: leadSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingLead) {
          await updateLead({ id: editingLead.id, ...values }).unwrap();
        } else {
          await createLead(values).unwrap();
        }
        setIsModalOpen(false);
        setEditingLead(null);
        resetForm();
      } catch (err) {
        console.error("Failed to save lead", err);
      }
    },
  });

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    formik.setValues({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.status || 'New',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLead(null);
    formik.resetForm();
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateLead({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update lead status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id).unwrap();
      } catch (err) {
        console.error("Failed to delete lead", err);
      }
    }
  };

  const filteredLeads = leads.filter((lead: any) => 
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Inbox className="w-8 h-8 text-blue-400" />
            Demo Requests & Leads
          </h1>
          <p className="text-slate-400 text-sm">Manage incoming inquiries from the TokenShield marketing site</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 w-64 shadow-inner"
          />
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </header>

      <div className="glass-card overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Contact</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Company</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Date Received</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{lead.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300 font-medium">{lead.company}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border appearance-none cursor-pointer focus:outline-none ${
                          lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          lead.status === 'Contacted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-white">New</option>
                        <option value="Contacted" className="bg-slate-900 text-white">Contacted</option>
                        <option value="Qualified" className="bg-slate-900 text-white">Qualified</option>
                        <option value="Lost" className="bg-slate-900 text-white">Lost</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300">{lead.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(lead)} className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition group">
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-2 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition group">
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
            <h2 className="text-xl font-bold text-white mb-6">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                <input
                  name="company"
                  type="text"
                  value={formik.values.company}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
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
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingLead ? (isUpdating ? 'Updating...' : 'Update') : (isCreating ? 'Adding...' : 'Add Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
