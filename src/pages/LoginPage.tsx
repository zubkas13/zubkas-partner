import { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, User, Sparkles, Eye, EyeOff, ArrowLeft, CircleCheck as CheckCircle2, TrendingUp, Users, DollarSign, Crown, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePWAInstall } from '@/utils/usePWAInstall';

type LoginMode = 'partner' | 'admin';

interface LoginPageProps {
  onBack: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { login, partnerUsers, siteContent: c } = useApp();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [mode, setMode] = useState<LoginMode>('partner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hardcodedPartnerEmails = ['partner@zubkas.com', 'neha@zubkas.com', 'rahul@zubkas.com', 'anita@zubkas.com', 'suresh@zubkas.com'];
  const adminEmails = ['admin@zubkas.com', 'employee@zubkas.com', 'support@zubkas.com', 'zubkastechnology@gmail.com'];
  const partnerEmails = [...hardcodedPartnerEmails, ...partnerUsers.map(u => u.email.toLowerCase())];

  const loginFeatures = [
    { icon: DollarSign, title: c.loginFeature1Title, desc: c.loginFeature1Desc },
    { icon: TrendingUp, title: c.loginFeature2Title, desc: c.loginFeature2Desc },
    { icon: Shield, title: c.loginFeature3Title, desc: c.loginFeature3Desc },
  ];

  const loginStats = [
    { icon: Users, value: c.loginStat1Value, label: c.loginStat1Label },
    { icon: DollarSign, value: c.loginStat2Value, label: c.loginStat2Label },
    { icon: Crown, value: c.loginStat3Value, label: c.loginStat3Label },
  ];

  const validateMode = (emailToCheck: string): boolean => {
    const lower = emailToCheck.toLowerCase();
    if (mode === 'partner' && adminEmails.includes(lower)) {
      setError('This is an admin account. Switch to the Admin tab to sign in.');
      return false;
    }
    if (mode === 'admin' && partnerEmails.includes(lower)) {
      setError('This is a partner account. Switch to the Partner tab to sign in.');
      return false;
    }
    return true;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateMode(email)) return;
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) setError('Invalid email or password. Please check your credentials and try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side — dark crimson gradient with value props */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-zubkas-800 via-zubkas-900 to-zubkas-950 px-8 py-10 lg:w-1/2 lg:px-12 lg:py-12">
        {/* Glowing abstract shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-zubkas-600/30 blur-3xl" />
          <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-zubkas-500/20 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-zubkas-700/30 blur-3xl" />
          <div className="absolute top-1/2 right-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        </div>

        {/* Top — back button + logo */}
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/icons/zubkas_icon_hd_white.png"
              alt="Zubkas"
              width={36}
              height={36}
              className="h-9 w-9 object-contain shrink-0"
              loading="eager"
              draggable={false}
              onError={(e) => { const t = e.currentTarget; if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = '/assets/icons/zubkas_icon_hd_new.png'; } }}
            />
            <div>
              <p className="font-display text-base font-bold text-white leading-tight">Zubkas</p>
              <p className="text-[10px] text-zubkas-200 leading-tight">Partner Program</p>
            </div>
          </div>
        </div>

        {/* Middle — value propositions */}
        <div className="relative z-10 my-12 lg:my-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {c.loginBadge}
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {c.loginHeroTitle1}
            <br />
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              {c.loginHeroTitle2}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-zubkas-100 leading-relaxed">
            {c.loginHeroSubtitle}
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {loginFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <f.icon className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-sm text-zubkas-200">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — live stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          {loginStats.map((s, i) => (
            <div key={i} className="text-center">
              <s.icon className="mx-auto h-5 w-5 text-amber-300/70" />
              <p className="mt-1.5 font-display text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-zubkas-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — glassmorphic login card */}
      <div className="relative flex items-center justify-center bg-white px-6 py-10 lg:w-1/2 lg:px-12">

        <div className="relative z-10 w-full max-w-md animate-slide-up">
          {/* Glassmorphic card */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-gray-200/50 backdrop-blur-xl sm:p-10">
            {/* Mode toggle — animated */}
            <div className="relative mb-6 flex rounded-xl bg-gray-100/80 p-1">
              <div
                className={`absolute inset-y-1 w-1/2 rounded-lg bg-zubkas-700 shadow-md transition-all duration-300 ease-out ${mode === 'admin' ? 'left-1/2' : 'left-1'}`}
                style={{ width: 'calc(50% - 4px)' }}
              />
              <button
                onClick={() => switchMode('partner')}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${mode === 'partner' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <User className="h-4 w-4" />
                {c.loginTabPartner}
              </button>
              <button
                onClick={() => switchMode('admin')}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${mode === 'admin' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Shield className="h-4 w-4" />
                {c.loginTabAdmin}
              </button>
            </div>

            <h2 className="font-display text-2xl font-bold text-gray-900">
              {mode === 'partner' ? c.loginPartnerTitle : c.loginAdminTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'partner' ? c.loginPartnerSubtitle : c.loginAdminSubtitle}
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            {/* Password login form */}
            <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{c.loginEmailLabel}</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@zubkas.com"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-zubkas-700 focus:ring-4 focus:ring-zubkas-700/10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{c.loginPasswordLabel}</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-zubkas-700 focus:ring-4 focus:ring-zubkas-700/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Signing in...' : c.loginSignInButton}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

          </div>

          {/* PWA Install button */}
          {canInstall && !isInstalled && (
            <button
              onClick={promptInstall}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zubkas-200 bg-zubkas-50 py-3 text-sm font-semibold text-zubkas-700 transition-all hover:bg-zubkas-100 hover:border-zubkas-300"
            >
              <Download className="h-4 w-4" />
              {c.loginInstallButton}
            </button>
          )}
          {isInstalled && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {c.loginInstalledText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 text-center">
          <span className="text-xs text-gray-400">{c.loginFooterPoweredBy} <span className="font-display font-bold text-zubkas-700">Zubkas</span></span>
        </div>
      </div>
    </div>
  );
}
