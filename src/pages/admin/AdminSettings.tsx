import { useState } from 'react';
import { Settings as SettingsIcon, Save, Lock, Trash2, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';
import { Modal } from '@/components/Modal';

export function AdminSettings() {
  const { settings, updateSettings, clearDemoData } = useApp();
  const [leadLock, setLeadLock] = useState(String(settings.leadLockDays));
  const [capMonths, setCapMonths] = useState(String(settings.commissionCapMonths));
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [cleared, setCleared] = useState(false);
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ leadLockDays: Number(leadLock), commissionCapMonths: Number(capMonths) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    clearDemoData();
    setShowClearConfirm(false);
    setClearConfirmText('');
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Configure global partner program rules" />

      <form onSubmit={handleSave} className="card p-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
            <SettingsIcon className="h-5 w-5 text-zubkas-700" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">Business Rules</h3>
            <p className="text-xs text-gray-500">These settings apply to all partners globally</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" />
            Lead Lock Period (Days)
          </label>
          <input type="number" min="1" max="30" value={leadLock} onChange={(e) => setLeadLock(e.target.value)} className="input-field mt-1" />
          <p className="text-xs text-gray-400 mt-1">When a partner submits a lead, the company is locked for this many days. Other partners cannot add the same company during this period.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Commission Cap (Months)</label>
          <input type="number" min="1" max="24" value={capMonths} onChange={(e) => setCapMonths(e.target.value)} className="input-field mt-1" />
          <p className="text-xs text-gray-400 mt-1">Maximum number of months a partner earns commission on a monthly subscription. Default: 12 months (1 year).</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-1">Current Rules Summary</p>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Lead Lock: <span className="font-medium text-gray-700">{leadLock} days</span></li>
            <li>• Commission Cap: <span className="font-medium text-gray-700">{capMonths} months</span> from subscription start</li>
            <li>• Free Plan: 5% commission</li>
            <li>• Premium Plan: 15% commission</li>
            <li>• Unpaid customers: Commission blocked for that month</li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary"><Save className="h-4 w-4" /> Save Settings</button>
          {saved && <span className="text-sm text-emerald-600 font-medium animate-fade-in">Settings saved successfully!</span>}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="max-w-2xl rounded-xl border-2 border-red-200 bg-red-50/50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-gray-900">Danger Zone</h3>
            <p className="text-xs text-gray-500 mt-0.5">Irreversible actions that affect all application data</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Clear All Demo Data</p>
              <p className="text-xs text-gray-500 mt-0.5">Removes all customers, leads, and commission transactions. Partners, employees, and settings are preserved.</p>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Clear Data
            </button>
          </div>
          {cleared && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 animate-fade-in">
              <CheckCircle2 className="h-4 w-4" />
              All demo data has been cleared successfully.
            </div>
          )}
        </div>

      </div>

      {/* Clear Confirmation Modal */}
      <Modal open={showClearConfirm} onClose={() => { setShowClearConfirm(false); setClearConfirmText(''); }} title="Confirm: Clear All Demo Data" size="sm">
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
              <p className="text-xs text-red-700 mt-1">All customers, leads, and commission transactions will be permanently deleted from the application.</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Type <span className="font-bold text-red-600">CLEAR</span> to confirm
            </label>
            <input
              value={clearConfirmText}
              onChange={(e) => setClearConfirmText(e.target.value)}
              className="input-field mt-1"
              placeholder="CLEAR"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowClearConfirm(false); setClearConfirmText(''); }}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={clearConfirmText !== 'CLEAR'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
