"use client";

import { Save, MessageSquare, Mail, Bell, Shield, Lock } from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  slackWebhook: Yup.string().url('Must be a valid URL'),
  discordWebhook: Yup.string().url('Must be a valid URL'),
  twilioSid: Yup.string(),
  twilioToken: Yup.string(),
  twilioFrom: Yup.string(),
  smtpHost: Yup.string(),
  smtpPort: Yup.number().typeError('Must be a number'),
  smtpUser: Yup.string(),
  smtpPass: Yup.string(),
  autoBlockThreshold: Yup.number().min(0).max(100).required('Required'),
  maxContextWindow: Yup.number().min(1000).required('Required'),
  ssoEnabled: Yup.boolean(),
  ssoProvider: Yup.string(),
  dataResidency: Yup.string(),
  kmsUrl: Yup.string().url('Must be a valid URL'),
});

export default function SettingsPage() {
  const { data: configData, isLoading } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const formik = useFormik({
    initialValues: {
      slackWebhook: configData?.slackWebhook || '',
      discordWebhook: configData?.discordWebhook || '',
      twilioSid: configData?.twilioSid || '',
      twilioToken: configData?.twilioToken || '',
      twilioFrom: configData?.twilioFrom || '',
      smtpHost: configData?.smtpHost || '',
      smtpPort: configData?.smtpPort || '',
      smtpUser: configData?.smtpUser || '',
      smtpPass: configData?.smtpPass || '',
      autoBlockThreshold: configData?.autoBlockThreshold || 80,
      maxContextWindow: configData?.maxContextWindow || 128000,
      ssoEnabled: configData?.ssoEnabled || false,
      ssoProvider: configData?.ssoProvider || '',
      dataResidency: configData?.dataResidency || 'us-east',
      kmsUrl: configData?.kmsUrl || '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateSettings(values).unwrap();
        // Show success toast here
      } catch (e) {
        console.error(e);
      }
    },
  });

  if (isLoading) return <div className="p-12 text-white">Loading configuration...</div>;

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Admin Panel
          </h1>
          <p className="text-slate-400 text-sm">Platform Configuration & Operations Automation</p>
        </div>
        <button 
          onClick={() => formik.handleSubmit()}
          disabled={isUpdating || !formik.isValid}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isUpdating ? 'Saving...' : 'Save Configuration'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <section className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            ChatOps Channels
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Slack Webhook URL</label>
              <input 
                type="password" name="slackWebhook" 
                value={formik.values.slackWebhook} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {formik.touched.slackWebhook && formik.errors.slackWebhook && <p className="text-rose-400 text-xs mt-1">{formik.errors.slackWebhook as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Discord Webhook URL</label>
              <input 
                type="password" name="discordWebhook" 
                value={formik.values.discordWebhook} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {formik.touched.discordWebhook && formik.errors.discordWebhook && <p className="text-rose-400 text-xs mt-1">{formik.errors.discordWebhook as string}</p>}
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            SMS Alerts (Twilio)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Account SID</label>
              <input 
                type="text" name="twilioSid" 
                value={formik.values.twilioSid} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Auth Token</label>
              <input 
                type="password" name="twilioToken" 
                value={formik.values.twilioToken} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            SMTP Server
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Host</label>
              <input 
                type="text" name="smtpHost" 
                value={formik.values.smtpHost} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Port</label>
              <input 
                type="text" name="smtpPort" 
                value={formik.values.smtpPort} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {formik.touched.smtpPort && formik.errors.smtpPort && <p className="text-rose-400 text-xs mt-1">{formik.errors.smtpPort as string}</p>}
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            Operations Automation
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Auto-Block Risk Threshold</label>
                <span className="text-blue-400 font-mono text-sm">{formik.values.autoBlockThreshold}%</span>
              </div>
              <input 
                type="range" min="0" max="100" name="autoBlockThreshold" 
                value={formik.values.autoBlockThreshold} onChange={formik.handleChange}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm font-medium text-slate-200 mb-1">Maximum Context Window</label>
              <input 
                type="number" name="maxContextWindow" 
                value={formik.values.maxContextWindow} onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {formik.touched.maxContextWindow && formik.errors.maxContextWindow && <p className="text-rose-400 text-xs mt-1">{formik.errors.maxContextWindow as string}</p>}
            </div>
          </div>
        </section>
        <section className="glass-card p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
            <Lock className="w-5 h-5 text-indigo-400" />
            Enterprise Security & Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <label className="flex items-center justify-between mb-3 cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-white block">Enable SSO / SAML 2.0</span>
                    <span className="text-xs text-slate-400">Enforce enterprise identity provider</span>
                  </div>
                  <input type="checkbox" name="ssoEnabled" checked={formik.values.ssoEnabled} onChange={formik.handleChange} className="w-4 h-4 accent-indigo-500" />
                </label>
                <input 
                  type="text" name="ssoProvider" placeholder="Identity Provider URL (e.g., Okta, Azure AD)"
                  value={formik.values.ssoProvider} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  disabled={!formik.values.ssoEnabled}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Customer-Managed Keys (KMS URL)</label>
                <input 
                  type="text" name="kmsUrl" placeholder="https://..."
                  value={formik.values.kmsUrl} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                {formik.touched.kmsUrl && formik.errors.kmsUrl && <p className="text-rose-400 text-xs mt-1">{formik.errors.kmsUrl as string}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Data Residency Region</label>
                <select 
                  name="dataResidency" 
                  value={formik.values.dataResidency} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="us-east">US East (N. Virginia)</option>
                  <option value="eu-central">EU Central (Frankfurt)</option>
                  <option value="ap-south">Asia Pacific (Mumbai)</option>
                  <option value="global">Global (Multi-Region Edge)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Ensures compliance with local data protection laws (e.g., GDPR).</p>
              </div>
              <div className="pt-2">
                <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition text-sm font-medium text-indigo-300">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Configure Role Permissions (RBAC)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
