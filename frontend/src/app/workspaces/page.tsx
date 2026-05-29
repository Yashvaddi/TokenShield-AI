"use client";

import { Building2, Plus, Users, Shield, MoreVertical, Search, Settings, UserPlus, X, FileText, MessageSquare, Clock, Activity } from 'lucide-react';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateProjectMutation, useCreateUserMutation, useGetUsersQuery, useGetProjectsQuery, useDeleteUserMutation, useUpdateUserMutation, useDeleteProjectMutation, useUpdateProjectMutation } from '@/store/apiSlice';
import { Trash2, Edit2 } from 'lucide-react';

const workspaceSchema = Yup.object({
  name: Yup.string().required('Workspace name is required').min(3, 'Must be at least 3 characters'),
  plan: Yup.string().oneOf(['starter', 'pro', 'enterprise']).required('Plan is required'),
});

const userSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().oneOf(['admin', 'manager', 'developer', 'viewer']).required('Role is required'),
});

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const { data: rawUsers, isLoading: isLoadingUsers } = useGetUsersQuery({});
  const { data: rawProjects, isLoading: isLoadingProjects } = useGetProjectsQuery({});

  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdatingProject }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateUser({ id, role: newRole }).unwrap();
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        console.error("Failed to delete user", err);
      }
    }
  };

  const handleDeleteProject = async (id: string, e: any) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workspace?")) {
      try {
        await deleteProject(id).unwrap();
      } catch (err) {
        console.error("Failed to delete project", err);
      }
    }
  };

  const members = rawUsers || [];
  const projects = rawProjects || [];

  const workspaceFormik = useFormik({
    initialValues: { name: '', plan: 'starter', monthly_budget: 0 },
    validationSchema: workspaceSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingProject) {
          await updateProject({ id: editingProject.id, ...values }).unwrap();
        } else {
          await createProject(values).unwrap();
        }
        setIsWorkspaceModalOpen(false);
        setEditingProject(null);
        resetForm();
      } catch (err) {
        console.error(err);
      }
    },
  });

  const handleEditProject = (project: any, e: any) => {
    e.stopPropagation();
    setEditingProject(project);
    workspaceFormik.setValues({
      name: project.name,
      plan: project.plan || 'starter',
      monthly_budget: project.monthly_budget || 0,
    });
    setIsWorkspaceModalOpen(true);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    workspaceFormik.resetForm();
    setIsWorkspaceModalOpen(true);
  };

  const userFormik = useFormik({
    initialValues: { email: '', role: 'developer' },
    validationSchema: userSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createUser(values).unwrap();
        setIsUserModalOpen(false);
        resetForm();
      } catch (err) {
        console.error(err);
        setIsUserModalOpen(false);
        resetForm();
      }
    },
  });

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[10%] right-[30%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-teal-400" />
            Workspace Organization
          </h1>
          <p className="text-slate-400 text-sm">Manage multi-tenant environments, team members, and role-based access</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700 transition">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-teal-600 text-white shadow-[0_0_15px_rgba(13,148,136,0.4)] hover:bg-teal-500 transition"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Active Workspace Info */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  Ac
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Acme Corp.</h2>
                  <p className="text-xs font-mono text-teal-400">ws_89f21a</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Primary
              </span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Users className="w-5 h-5 text-slate-500" />
                <span>12 Active Team Members</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Shield className="w-5 h-5 text-slate-500" />
                <span>Enterprise Security Policies Enforced</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900 z-10 pb-1">Switch Workspace</h3>
            {projects.map((p: any) => (
              <button key={p.id} className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex justify-between items-center group">
                <span className="text-slate-200 text-sm font-medium">{p.name} ({p.plan})</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.id.split('-')[0]}
                  </span>
                  <div onClick={(e) => handleEditProject(p, e)} className="p-1 rounded hover:bg-teal-500/20 text-slate-500 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition">
                    <Edit2 className="w-3 h-3" />
                  </div>
                  <div onClick={(e) => handleDeleteProject(p.id, e)} className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-3 h-3" />
                  </div>
                </div>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-slate-400">No other workspaces available.</p>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="glass-card p-0 lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Team Directory
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 w-full sm:w-48 shadow-inner"
                />
              </div>
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 transition border border-teal-500/20"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Member</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Role</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                          {member.name ? member.name.charAt(0) : member.email?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{member.name || 'Invited User'}</span>
                          <span className="text-xs text-slate-500">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border appearance-none cursor-pointer focus:outline-none ${
                          member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          member.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        <option value="admin" className="bg-slate-900 text-white">admin</option>
                        <option value="manager" className="bg-slate-900 text-white">manager</option>
                        <option value="developer" className="bg-slate-900 text-white">developer</option>
                        <option value="viewer" className="bg-slate-900 text-white">viewer</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="text-sm text-slate-300">{member.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDeleteUser(member.id)} className="p-2 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition group">
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collaboration & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mt-8">
        {/* Shared Prompts & Assets */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Shared Resources
          </h2>
          <div className="space-y-3 flex-1">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 transition flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded text-teal-400"><FileText className="w-4 h-4" /></div>
                <span className="text-slate-200 text-sm font-medium">Team Prompt Library</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">24 Items</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 transition flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded text-indigo-400"><Shield className="w-4 h-4" /></div>
                <span className="text-slate-200 text-sm font-medium">Custom Security Rules</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">8 Rules</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 transition flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded text-rose-400"><MessageSquare className="w-4 h-4" /></div>
                <span className="text-slate-200 text-sm font-medium">Team Chat & Comments</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
          </div>
          <button className="w-full py-2.5 mt-6 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition">
            Manage Resources
          </button>
        </div>

        {/* Workspace Activity Feed */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Real-time Collaboration & History
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              3 Members Online
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">JD</div>
              <div className="flex-1 border-b border-white/5 pb-4">
                <p className="text-sm text-slate-300"><span className="text-white font-medium">John Doe</span> updated the prompt template <span className="text-teal-400 font-mono text-xs">system-v2</span></p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 5 mins ago</span>
                  <button className="text-xs text-blue-400 hover:underline">View Version History</button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">AS</div>
              <div className="flex-1 border-b border-white/5 pb-4">
                <p className="text-sm text-slate-300"><span className="text-white font-medium">Alice Smith</span> commented on <span className="text-teal-400 font-mono text-xs">Customer Support Agent</span></p>
                <div className="bg-black/30 border border-white/5 rounded p-3 mt-2 text-sm text-slate-400 italic">
                  "I think we should increase the strictness of the PII redaction rule here."
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</span>
                  <button className="text-xs text-blue-400 hover:underline">Reply</button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shrink-0">SYS</div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">New workspace <span className="text-white font-medium">Wayne Enterprises</span> was created by Admin.</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsWorkspaceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              {editingProject ? 'Edit Workspace' : 'Create New Workspace'}
            </h2>
            
            <form onSubmit={workspaceFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Workspace / Project Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={workspaceFormik.values.name}
                  onChange={workspaceFormik.handleChange}
                  onBlur={workspaceFormik.handleBlur}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${workspaceFormik.touched.name && workspaceFormik.errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-teal-500'} rounded-lg text-white focus:outline-none transition`}
                />
                {workspaceFormik.touched.name && workspaceFormik.errors.name && (
                  <p className="text-rose-400 text-xs mt-1">{workspaceFormik.errors.name as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Plan</label>
                <select
                  name="plan"
                  value={workspaceFormik.values.plan}
                  onChange={workspaceFormik.handleChange}
                  onBlur={workspaceFormik.handleBlur}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 transition appearance-none"
                >
                  <option value="starter">Starter Plan (Free)</option>
                  <option value="pro">Pro Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject || isUpdatingProject}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingProject ? (isUpdatingProject ? 'Saving...' : 'Save Changes') : (isCreatingProject ? 'Creating...' : 'Create Workspace')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-400" />
              Invite Team Member
            </h2>
            
            <form onSubmit={userFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="developer@company.com"
                  value={userFormik.values.email}
                  onChange={userFormik.handleChange}
                  onBlur={userFormik.handleBlur}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${userFormik.touched.email && userFormik.errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-teal-500'} rounded-lg text-white focus:outline-none transition`}
                />
                {userFormik.touched.email && userFormik.errors.email && (
                  <p className="text-rose-400 text-xs mt-1">{userFormik.errors.email as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role (RBAC)</label>
                <select
                  name="role"
                  value={userFormik.values.role}
                  onChange={userFormik.handleChange}
                  onBlur={userFormik.handleBlur}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 transition appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Developers can generate API keys but cannot change billing settings.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingUser ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
