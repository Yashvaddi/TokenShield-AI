"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Edit2, Play, Square, Activity, X, Trash2 } from 'lucide-react';
import { useGetRulesQuery, useCreateRuleMutation, useUpdateRuleMutation, useDeleteRuleMutation } from '@/store/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  condition_type: Yup.string().required('Required'),
  threshold: Yup.number().required('Required').min(0),
  window_seconds: Yup.number().required('Required').min(1),
});

export default function RulesPage() {
  const { data: rules = [], isLoading } = useGetRulesQuery({});
  const [createRule] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      condition_type: 'budget_used_pct',
      threshold: 80,
      window_seconds: 3600,
      actions: ['slack_alert'],
      enabled: true,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingRule) {
          await updateRule({ id: editingRule.id, ...values }).unwrap();
        } else {
          await createRule(values).unwrap();
        }
        setIsModalOpen(false);
        setEditingRule(null);
        resetForm();
      } catch (err) {
        console.error('Failed to save rule', err);
      }
    },
  });

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    formik.setValues({
      name: rule.name,
      condition_type: rule.condition_type || 'budget_used_pct',
      threshold: rule.threshold || 80,
      window_seconds: rule.window_seconds || 3600,
      actions: rule.actions || ['slack_alert'],
      enabled: rule.enabled,
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(null);
    formik.resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id).unwrap();
    }
  };

  const toggleRuleStatus = async (rule: any) => {
    await updateRule({ 
      id: rule.id, 
      name: rule.name,
      condition_type: rule.condition_type,
      threshold: rule.threshold,
      window_seconds: rule.window_seconds,
      actions: rule.actions,
      enabled: !rule.enabled 
    }).unwrap();
  };

  if (isLoading) return <div className="p-12 text-white">Loading rules...</div>;

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[10%] right-[20%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Alert Rules
          </h1>
          <p className="text-slate-400 text-sm">Configure detection thresholds and automated responses</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition">
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </header>

      {rules.length === 0 && (
        <div className="text-center py-12 glass-card relative z-10">
          <p className="text-slate-400">No rules configured yet. Create one to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {rules.map((rule: any) => (
          <div key={rule.id} className={`glass-card p-6 border ${rule.status === 'active' ? 'border-white/10' : 'border-white/5 opacity-70'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${rule.status === 'active' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800 border border-white/5'}`}>
                  <ShieldAlert className={`w-5 h-5 ${rule.status === 'active' ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`flex w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{rule.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(rule)} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(rule.id)} className="p-2 rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleRuleStatus(rule)}
                  className={`p-2 rounded-md border transition ${rule.status === 'active' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                >
                  {rule.status === 'active' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">If Condition Matches:</p>
                <code className="text-sm text-indigo-300 font-mono">{rule.condition}</code>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Then Execute:</p>
                <p className="text-sm text-emerald-300">{rule.action}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Activity className="w-4 h-4" />
                {rule.matches} matches in 24h
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
            <h2 className="text-xl font-bold text-white mb-6">{editingRule ? 'Edit Rule' : 'Create Rule'}</h2>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Volume Spike"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Condition Type</label>
                <select
                  name="condition_type"
                  value={formik.values.condition_type}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="budget_used_pct">Budget Used (%)</option>
                  <option value="requests_per_sec">Requests per Second</option>
                  <option value="semantic_score">Semantic Risk Score</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Threshold</label>
                  <input
                    name="threshold"
                    type="number"
                    value={formik.values.threshold}
                    onChange={formik.handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Window (sec)</label>
                  <input
                    name="window_seconds"
                    type="number"
                    value={formik.values.window_seconds}
                    onChange={formik.handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  name="enabled"
                  value={formik.values.enabled ? "true" : "false"}
                  onChange={(e) => formik.setFieldValue('enabled', e.target.value === "true")}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
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
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition"
                >
                  {editingRule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
