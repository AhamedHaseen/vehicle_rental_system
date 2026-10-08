import { useState } from 'react';
import { getSystemSettings, updateSystemSettings } from '../../services/dataService';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminSettings = () => {
  const { success, error } = useToast();
  const [settings, setSettings] = useState(() => getSystemSettings());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateSystemSettings(settings);
      success('Settings Updated', 'System policies and company credentials saved.');
    } catch (err) {
      error('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          System Rules & Operational Settings
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Configure islandwide dispatch policies, surcharge rates, security deposit defaults and company branding.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Identity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Company Profile & Flagship Hub
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company Trading Name</label>
              <input
                type="text"
                value={settings.company_info?.name || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  company_info: { ...settings.company_info, name: e.target.value }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.company_info?.email || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  company_info: { ...settings.company_info, email: e.target.value }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">24/7 Roadside Hotline</label>
              <input
                type="text"
                value={settings.company_info?.phone || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  company_info: { ...settings.company_info, phone: e.target.value }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Headquarters Address</label>
              <input
                type="text"
                value={settings.company_info?.address || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  company_info: { ...settings.company_info, address: e.target.value }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Rental Policies & Surcharge formulas */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Rental Rules & Fee Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Min Rental Duration (Days)</label>
              <input
                type="number"
                min="1"
                value={settings.rental_policies?.minRentalDays || 1}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, minRentalDays: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Free Cancellation Window (Hours)</label>
              <input
                type="number"
                min="0"
                value={settings.rental_policies?.cancellationGraceHours || 24}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, cancellationGraceHours: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Base Security Deposit (LKR)</label>
              <input
                type="number"
                min="0"
                value={settings.rental_policies?.securityDepositDefault || 20000}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, securityDepositDefault: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fleet Tax / VAT (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={settings.rental_policies?.taxPercent || 2.5}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, taxPercent: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Late Return Fee Per Hour (LKR)</label>
              <input
                type="number"
                min="0"
                value={settings.rental_policies?.lateReturnFeePerHour || 1500}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, lateReturnFeePerHour: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Weekend Surcharge (%)</label>
              <input
                type="number"
                min="0"
                value={settings.rental_policies?.weekendSurchargePercent || 10}
                onChange={(e) => setSettings({
                  ...settings,
                  rental_policies: { ...settings.rental_policies, weekendSurchargePercent: Number(e.target.value) }
                })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="lg" type="submit" isLoading={isSaving} icon={CheckCircle2}>
            Save Operational Policies
          </Button>
        </div>
      </form>
    </div>
  );
};
