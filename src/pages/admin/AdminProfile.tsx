import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building2, Calendar, Shield, Lock, Eye, EyeOff, CheckCircle2, KeyRound, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';
import { formatDate, getInitials } from '@/utils/helpers';

export function AdminProfile() {
  const { currentUser, updateUserProfile, updateUserPassword } = useApp();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [company, setCompany] = useState(currentUser?.company ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  if (!currentUser) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, company });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    const result = updateUserPassword({ currentPassword, newPassword });
    if (result.success) {
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 2500);
    } else {
      setPwError(result.error ?? 'Failed to update password');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="My Profile" subtitle="Manage your account details and security settings" />

      {/* Profile header card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-zubkas-700 to-zubkas-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/15 text-xl sm:text-2xl font-bold backdrop-blur-sm">
              {getInitials(currentUser.name)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold">{currentUser.name}</h2>
              <p className="text-zubkas-100 text-sm">{currentUser.role === 'admin' ? 'Administrator' : currentUser.employeeRole ?? 'Employee'}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <Shield className="h-3.5 w-3.5" />
                {currentUser.role === 'admin' ? 'Full Access' : 'Staff Access'}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{currentUser.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Joined</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(currentUser.joinedDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Details */}
      <form onSubmit={handleProfileSave} className="card p-6 max-w-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
            <UserIcon className="h-5 w-5 text-zubkas-700" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">Profile Details</h3>
            <p className="text-xs text-gray-500">Update your personal information</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Login Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field mt-1" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-field pl-9" placeholder="Optional" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary"><Save className="h-4 w-4" /> Save Profile</button>
          {profileSaved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
            </span>
          )}
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSave} className="card p-6 max-w-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
            <KeyRound className="h-5 w-5 text-zubkas-700" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-500">Update your login password securely</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pl-9 pr-10"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-9 pr-10"
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-amber-600 mt-1">Password must be at least 6 characters</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="Re-enter new password"
              />
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        {pwError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 animate-fade-in">{pwError}</div>
        )}
        {pwSuccess && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" /> Password updated successfully!
          </div>
        )}

        <button type="submit" className="btn-primary"><KeyRound className="h-4 w-4" /> Update Password</button>
      </form>
    </div>
  );
}
