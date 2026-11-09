import { useState } from 'react';
import { Mail, Phone, Calendar, Building2, Shield, Crown, Star, Award, Rocket, Lock, Eye, EyeOff, CircleCheck as CheckCircle2, KeyRound, Save, User as UserIcon, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';
import { formatDate, getInitials } from '@/utils/helpers';
import { computeAllPartnerStats, partnerWithStats } from '@/utils/partnerStats';

const badgeIcons: Record<string, typeof Crown> = { 'Top Performer': Crown, 'Rising Star': Star, 'Consistent Earner': Award, 'New Champion': Rocket };

export function PartnerProfile() {
  const { currentUser, partners, customers, leads, transactions, updateUserProfile, updateUserPassword } = useApp();
  const rawPartner = partners.find(p => p.id === currentUser?.partnerId);
  const statsMap = computeAllPartnerStats(partners, customers, leads, transactions);
  const partner = rawPartner ? partnerWithStats(rawPartner, statsMap) : null;

  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp ?? '');
  const [company, setCompany] = useState(partner?.company ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  if (!partner || !currentUser) return null;
  const myCustomers = customers.filter(c => c.partnerId === partner.id);
  const BadgeIcon = partner.badge ? badgeIcons[partner.badge] ?? Crown : null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, whatsapp, company });
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
              {getInitials(partner.name)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold">{partner.name}</h2>
              <p className="text-zubkas-100 text-sm">{partner.company}</p>
              {partner.badge && BadgeIcon && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  <BadgeIcon className="h-3.5 w-3.5" />
                  {partner.badge}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{partner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{partner.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Building2 className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-gray-900">{partner.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Partner Since</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(partner.joinedDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-50 p-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900">{partner.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Customers', value: String(myCustomers.filter(c => c.status === 'Active').length) },
          { label: 'Monthly Sales', value: `₹${(partner.monthlySales / 1000).toFixed(1)}K` },
          { label: 'Total Commission', value: `₹${(partner.totalCommission / 1000).toFixed(1)}K` },
          { label: 'Pending Commission', value: `₹${(partner.pendingCommission / 1000).toFixed(1)}K` },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Edit Profile Details */}
      <form onSubmit={handleProfileSave} className="card p-6 max-w-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
            <UserIcon className="h-5 w-5 text-zubkas-700" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">Profile Details</h3>
            <p className="text-xs text-gray-500">Update your personal and business information</p>
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
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field mt-1" placeholder="+91 90000 11111" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
            <div className="relative mt-1">
              <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field pl-9" placeholder="+91 90000 11111" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-field pl-9" />
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

      {/* Customer list */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-gray-900 mb-4">My Customers ({myCustomers.length})</h3>
        <div className="space-y-2">
          {myCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No customers yet</p>
          ) : (
            myCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.companyName}</p>
                </div>
                <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
