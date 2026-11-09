import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, LayoutDashboard, LogIn, Type, ChartBar as BarChart3, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';
import { supabase } from '@/lib/supabase';
import type { SiteContent } from '@/types';
import { defaultSiteContent } from '@/data/mockData';

type Tab = 'landing' | 'login' | 'partner';

interface FieldDef {
  key: keyof SiteContent;
  label: string;
  type: 'input' | 'textarea';
}

interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

const landingGroups: FieldGroup[] = [
  {
    title: 'Navigation',
    fields: [
      { key: 'landingNavSignIn', label: 'Sign In Button', type: 'input' },
    ],
  },
  {
    title: 'Hero Section',
    fields: [
      { key: 'landingBadge', label: 'Hero Badge Text', type: 'input' },
      { key: 'landingHeroTitle1', label: 'Hero Title (Line 1)', type: 'input' },
      { key: 'landingHeroTitle2', label: 'Hero Title (Line 2 — highlighted)', type: 'input' },
      { key: 'landingHeroTitle3', label: 'Hero Title (Line 3)', type: 'input' },
      { key: 'landingHeroSubtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'landingCtaPrimary', label: 'Primary CTA Button', type: 'input' },
      { key: 'landingCtaSecondary', label: 'Secondary CTA Button', type: 'input' },
    ],
  },
  {
    title: 'Trust Badges',
    fields: [
      { key: 'landingTrust1Label', label: 'Trust Badge 1 Label', type: 'input' },
      { key: 'landingTrust1Sub', label: 'Trust Badge 1 Subtext', type: 'input' },
      { key: 'landingTrust2Label', label: 'Trust Badge 2 Label', type: 'input' },
      { key: 'landingTrust2Sub', label: 'Trust Badge 2 Subtext', type: 'input' },
      { key: 'landingTrust3Label', label: 'Trust Badge 3 Label', type: 'input' },
      { key: 'landingTrust3Sub', label: 'Trust Badge 3 Subtext', type: 'input' },
    ],
  },
  {
    title: 'Stats Bar',
    fields: [
      { key: 'landingStat1Value', label: 'Stat 1 Value', type: 'input' },
      { key: 'landingStat1Label', label: 'Stat 1 Label', type: 'input' },
      { key: 'landingStat2Value', label: 'Stat 2 Value', type: 'input' },
      { key: 'landingStat2Label', label: 'Stat 2 Label', type: 'input' },
      { key: 'landingStat3Value', label: 'Stat 3 Value', type: 'input' },
      { key: 'landingStat3Label', label: 'Stat 3 Label', type: 'input' },
      { key: 'landingStat4Value', label: 'Stat 4 Value', type: 'input' },
      { key: 'landingStat4Label', label: 'Stat 4 Label', type: 'input' },
    ],
  },
  {
    title: 'Features Section',
    fields: [
      { key: 'landingFeaturesLabel', label: 'Section Label', type: 'input' },
      { key: 'landingFeaturesHeading', label: 'Section Heading', type: 'input' },
      { key: 'landingFeaturesSubheading', label: 'Section Subheading', type: 'textarea' },
      { key: 'landingFeature1Title', label: 'Feature Card 1 Title', type: 'input' },
      { key: 'landingFeature1Desc', label: 'Feature Card 1 Description', type: 'textarea' },
      { key: 'landingFeature2Title', label: 'Feature Card 2 Title', type: 'input' },
      { key: 'landingFeature2Desc', label: 'Feature Card 2 Description', type: 'textarea' },
      { key: 'landingFeature3Title', label: 'Feature Card 3 Title', type: 'input' },
      { key: 'landingFeature3Desc', label: 'Feature Card 3 Description', type: 'textarea' },
      { key: 'landingFeature4Title', label: 'Feature Card 4 Title', type: 'input' },
      { key: 'landingFeature4Desc', label: 'Feature Card 4 Description', type: 'textarea' },
      { key: 'landingFeature5Title', label: 'Feature Card 5 Title', type: 'input' },
      { key: 'landingFeature5Desc', label: 'Feature Card 5 Description', type: 'textarea' },
      { key: 'landingFeature6Title', label: 'Feature Card 6 Title', type: 'input' },
      { key: 'landingFeature6Desc', label: 'Feature Card 6 Description', type: 'textarea' },
    ],
  },
  {
    title: 'Earnings Section',
    fields: [
      { key: 'landingEarningsLabel', label: 'Section Label', type: 'input' },
      { key: 'landingEarningsHeading', label: 'Section Heading', type: 'input' },
      { key: 'landingEarningsDesc', label: 'Section Description', type: 'textarea' },
      { key: 'landingEarningsBullet1', label: 'Bullet Point 1', type: 'input' },
      { key: 'landingEarningsBullet2', label: 'Bullet Point 2', type: 'input' },
      { key: 'landingEarningsBullet3', label: 'Bullet Point 3', type: 'input' },
      { key: 'landingEarningsBullet4', label: 'Bullet Point 4', type: 'input' },
    ],
  },
  {
    title: 'Earnings Floating Cards',
    fields: [
      { key: 'landingCard1Label', label: 'Card 1 Label', type: 'input' },
      { key: 'landingCard1Value', label: 'Card 1 Value', type: 'input' },
      { key: 'landingCard1Trend', label: 'Card 1 Trend Text', type: 'input' },
      { key: 'landingCard2Title', label: 'Card 2 Title', type: 'input' },
      { key: 'landingCard2Name', label: 'Card 2 Name', type: 'input' },
      { key: 'landingCard2Value', label: 'Card 2 Value', type: 'input' },
      { key: 'landingCard2Sub', label: 'Card 2 Subtext', type: 'input' },
      { key: 'landingCard3Label', label: 'Card 3 Label', type: 'input' },
      { key: 'landingCard3Value', label: 'Card 3 Value', type: 'input' },
      { key: 'landingCard3Sub', label: 'Card 3 Subtext', type: 'input' },
      { key: 'landingCard4Title', label: 'Card 4 Title', type: 'input' },
      { key: 'landingCard4Sub', label: 'Card 4 Subtext', type: 'input' },
    ],
  },
  {
    title: 'How It Works Section',
    fields: [
      { key: 'landingHowItWorksLabel', label: 'Section Label', type: 'input' },
      { key: 'landingHowItWorksHeading', label: 'Section Heading', type: 'input' },
      { key: 'landingStep1Title', label: 'Step 1 Title', type: 'input' },
      { key: 'landingStep1Desc', label: 'Step 1 Description', type: 'textarea' },
      { key: 'landingStep2Title', label: 'Step 2 Title', type: 'input' },
      { key: 'landingStep2Desc', label: 'Step 2 Description', type: 'textarea' },
      { key: 'landingStep3Title', label: 'Step 3 Title', type: 'input' },
      { key: 'landingStep3Desc', label: 'Step 3 Description', type: 'textarea' },
    ],
  },
  {
    title: 'CTA Section',
    fields: [
      { key: 'landingCtaSectionHeading', label: 'CTA Section Heading', type: 'input' },
      { key: 'landingCtaSectionDesc', label: 'CTA Section Description', type: 'textarea' },
      { key: 'landingCtaSectionButton', label: 'CTA Section Button', type: 'input' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { key: 'landingFooterTagline', label: 'Footer Tagline', type: 'input' },
      { key: 'landingFooterSub', label: 'Footer Subtext', type: 'input' },
      { key: 'landingFooterCopyright', label: 'Footer Copyright Text', type: 'input' },
      { key: 'landingFooterPoweredBy', label: 'Footer "Powered By" Text', type: 'input' },
    ],
  },
];

const partnerGroups: FieldGroup[] = [
  {
    title: 'Free Plan Box',
    fields: [
      { key: 'commissionFreeTitle', label: 'Title', type: 'input' },
      { key: 'commissionFreeValue', label: 'Commission Rate / Value Text', type: 'input' },
      { key: 'commissionFreeDesc', label: 'Description', type: 'input' },
    ],
  },
  {
    title: 'Premium Plan Box',
    fields: [
      { key: 'commissionPremiumTitle', label: 'Title', type: 'input' },
      { key: 'commissionPremiumValue', label: 'Commission Rate / Value Text', type: 'input' },
      { key: 'commissionPremiumDesc', label: 'Description', type: 'input' },
    ],
  },
  {
    title: '1-Year Cap Box',
    fields: [
      { key: 'commissionCapTitle', label: 'Title', type: 'input' },
      { key: 'commissionCapValue', label: 'Cap Value Text', type: 'input' },
      { key: 'commissionCapDesc', label: 'Description', type: 'input' },
    ],
  },
  {
    title: 'Rules Notice Paragraph',
    fields: [
      { key: 'commissionRulesNotice', label: 'Commission Rules & Rates Notice Text', type: 'textarea' },
    ],
  },
  {
    title: 'Plans & Features — Section Header',
    fields: [
      { key: 'plansHeaderTitle', label: 'Section Title', type: 'input' },
      { key: 'plansHeaderSubtitle', label: 'Section Subtitle', type: 'input' },
    ],
  },
  {
    title: 'Plans & Features — Banner',
    fields: [
      { key: 'plansBannerHeading', label: 'Banner Heading', type: 'input' },
      { key: 'plansBannerDesc', label: 'Banner Description', type: 'textarea' },
    ],
  },
  {
    title: 'Leaderboard — Section Header',
    fields: [
      { key: 'leaderboardHeaderTitle', label: 'Section Title', type: 'input' },
      { key: 'leaderboardHeaderSubtitle', label: 'Section Subtitle', type: 'input' },
    ],
  },
  {
    title: 'Leaderboard — Badge System',
    fields: [
      { key: 'leaderboardBadgeSystemTitle', label: 'Badge System Title', type: 'input' },
      { key: 'leaderboardBadgeSystemDesc', label: 'Badge System Description', type: 'textarea' },
    ],
  },
  {
    title: 'Leaderboard — Empty State',
    fields: [
      { key: 'leaderboardEmptyTitle', label: 'Empty State Title', type: 'input' },
      { key: 'leaderboardEmptyMsg', label: 'Empty State Message', type: 'input' },
    ],
  },
  {
    title: 'Products Suite — Section Header',
    fields: [
      { key: 'productsHeaderTitle', label: 'Section Title', type: 'input' },
      { key: 'productsHeaderSubtitle', label: 'Section Subtitle', type: 'input' },
    ],
  },
  {
    title: 'Products Suite — Banner',
    fields: [
      { key: 'productsBannerHeading', label: 'Banner Heading', type: 'input' },
      { key: 'productsBannerDesc', label: 'Banner Description', type: 'textarea' },
    ],
  },
];

const loginGroups: FieldGroup[] = [
  {
    title: 'Left Panel — Hero',
    fields: [
      { key: 'loginBadge', label: 'Hero Badge Text', type: 'input' },
      { key: 'loginHeroTitle1', label: 'Hero Title (Line 1)', type: 'input' },
      { key: 'loginHeroTitle2', label: 'Hero Title (Line 2 — highlighted)', type: 'input' },
      { key: 'loginHeroSubtitle', label: 'Hero Subtitle', type: 'textarea' },
    ],
  },
  {
    title: 'Left Panel — Feature List',
    fields: [
      { key: 'loginFeature1Title', label: 'Feature 1 Title', type: 'input' },
      { key: 'loginFeature1Desc', label: 'Feature 1 Description', type: 'input' },
      { key: 'loginFeature2Title', label: 'Feature 2 Title', type: 'input' },
      { key: 'loginFeature2Desc', label: 'Feature 2 Description', type: 'input' },
      { key: 'loginFeature3Title', label: 'Feature 3 Title', type: 'input' },
      { key: 'loginFeature3Desc', label: 'Feature 3 Description', type: 'input' },
    ],
  },
  {
    title: 'Left Panel — Stats',
    fields: [
      { key: 'loginStat1Value', label: 'Stat 1 Value', type: 'input' },
      { key: 'loginStat1Label', label: 'Stat 1 Label', type: 'input' },
      { key: 'loginStat2Value', label: 'Stat 2 Value', type: 'input' },
      { key: 'loginStat2Label', label: 'Stat 2 Label', type: 'input' },
      { key: 'loginStat3Value', label: 'Stat 3 Value', type: 'input' },
      { key: 'loginStat3Label', label: 'Stat 3 Label', type: 'input' },
    ],
  },
  {
    title: 'Login Card — Titles',
    fields: [
      { key: 'loginPartnerTitle', label: 'Partner Login Title', type: 'input' },
      { key: 'loginPartnerSubtitle', label: 'Partner Login Subtitle', type: 'input' },
      { key: 'loginAdminTitle', label: 'Admin Login Title', type: 'input' },
      { key: 'loginAdminSubtitle', label: 'Admin Login Subtitle', type: 'input' },
    ],
  },
  {
    title: 'Login Card — Tabs & Methods',
    fields: [
      { key: 'loginTabPartner', label: 'Partner Tab Label', type: 'input' },
      { key: 'loginTabAdmin', label: 'Admin Tab Label', type: 'input' },
      { key: 'loginMethodPassword', label: 'Password Method Label', type: 'input' },
      { key: 'loginMethodOtp', label: 'OTP Method Label', type: 'input' },
    ],
  },
  {
    title: 'Login Card — Form Labels',
    fields: [
      { key: 'loginEmailLabel', label: 'Email Field Label', type: 'input' },
      { key: 'loginPasswordLabel', label: 'Password Field Label', type: 'input' },
      { key: 'loginOtpLabel', label: 'OTP Field Label', type: 'input' },
    ],
  },
  {
    title: 'Login Card — Buttons',
    fields: [
      { key: 'loginSignInButton', label: 'Sign In Button', type: 'input' },
      { key: 'loginSendOtpButton', label: 'Send OTP Button', type: 'input' },
      { key: 'loginVerifyButton', label: 'Verify & Sign In Button', type: 'input' },
      { key: 'loginChangeEmailButton', label: 'Change Email Button', type: 'input' },
    ],
  },
  {
    title: 'Login Card — OTP Messages',
    fields: [
      { key: 'loginOtpSentPrefix', label: 'OTP Sent Prefix', type: 'input' },
      { key: 'loginOtpSentSuffix', label: 'OTP Sent Suffix', type: 'input' },
    ],
  },
  {
    title: 'PWA Install & Footer',
    fields: [
      { key: 'loginInstallButton', label: 'Install App Button', type: 'input' },
      { key: 'loginInstalledText', label: 'App Installed Text', type: 'input' },
      { key: 'loginFooterPoweredBy', label: 'Footer "Powered By" Text', type: 'input' },
    ],
  },
];

export function AdminContentManager() {
  const { siteContent, updateSiteContent, resetSiteContent } = useApp();
  const [tab, setTab] = useState<Tab>('landing');
  const [form, setForm] = useState<SiteContent>(siteContent);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(siteContent);
  }, [siteContent]);

  const groups = tab === 'landing' ? landingGroups : tab === 'login' ? loginGroups : partnerGroups;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase
        .from('site_content')
        .upsert({
          id: 'singleton',
          content: form,
          updated_at: new Date().toISOString(),
        });
      if (upsertError) throw new Error(upsertError.message);
      updateSiteContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [form, updateSiteContent]);

  const handleReset = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase
        .from('site_content')
        .upsert({
          id: 'singleton',
          content: defaultSiteContent,
          updated_at: new Date().toISOString(),
        });
      if (upsertError) throw new Error(upsertError.message);
      resetSiteContent();
      setForm({ ...defaultSiteContent });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset content');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [resetSiteContent]);

  const handleChange = useCallback((key: keyof SiteContent, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Content Manager"
        subtitle="Edit all headings, text, and paragraphs on the Home and Login pages"
        action={
          <div className="flex gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                {error}
              </span>
            )}
            <button onClick={handleReset} className="btn-secondary" disabled={saving}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="rounded-xl bg-zubkas-50 border border-zubkas-200 p-4 text-sm text-zubkas-700 flex items-center gap-2">
        <Type className="h-4 w-4 shrink-0" />
        Changes are saved to the database and applied instantly. Use "Reset" to restore defaults.
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-gray-100">
        <button
          onClick={() => setTab('landing')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'landing' ? 'border-zubkas-700 text-zubkas-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Home / Landing Page
        </button>
        <button
          onClick={() => setTab('login')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'login' ? 'border-zubkas-700 text-zubkas-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <LogIn className="h-4 w-4" />
          Login Page
        </button>
        <button
          onClick={() => setTab('partner')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'partner' ? 'border-zubkas-700 text-zubkas-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Users className="h-4 w-4" />
          Partner Panel
        </button>
      </div>

      {/* Form fields organized by group */}
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.title} className="card p-6">
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
              <BarChart3 className="h-5 w-5 text-zubkas-700" />
              <p className="text-sm font-medium text-gray-700">{group.title}</p>
            </div>
            <div className="space-y-4">
              {group.fields.map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="input-field mt-1 min-h-20"
                    />
                  ) : (
                    <input
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="input-field mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
