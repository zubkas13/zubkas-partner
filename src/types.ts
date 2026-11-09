export type UserRole = 'admin' | 'employee' | 'partner';

export type AdminSectionKey =
  | 'dashboard' | 'partners' | 'leads' | 'employees' | 'categories'
  | 'plans' | 'products' | 'content' | 'announcements' | 'leaderboard'
  | 'settings' | 'roles' | 'support' | 'popups' | 'customer-payments' | 'customer-history';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: AdminSectionKey[];
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  partnerId?: string;
  employeeRole?: string;
  joinedDate: string;
}

export type PlanType = 'Monthly' | 'Yearly';
export type SubscriptionStatus = 'Active' | 'Unpaid';
export type PlanTier = 'Free' | 'Premium' | string;

export interface Plan {
  id: string;
  name: string;
  commissionRate: number;
  type: 'Monthly' | 'Yearly';
  description: string;
  features: string[];
  price?: number | null;
  isCustom?: boolean;
  gstApplicable?: boolean;
  gstRate?: number;
  gstAmount?: number;
}

export interface Customer {
  id: string;
  partnerId: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  whatsapp: string;
  planType: PlanType;
  planTier: PlanTier;
  commissionRate: number;
  subscriptionAmount: number;
  startDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  commissionEarned: number;
  commissionEndDate: string;
  monthsElapsed: number;
  remainingMonths: number;
}

export type LeadPaymentStatus = 'Paid' | 'Unpaid';

export interface Lead {
  id: string;
  partnerId: string;
  partnerName: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'Pending Approval' | 'Locked' | 'Approved' | 'Open' | 'Converted' | 'Lost' | 'Rejected';
  submittedDate: string;
  lockEndDate: string;
  notes: string;
  whatsapp?: string;
  productId?: string;
  productName?: string;
  planType?: PlanType;
  planPrice?: number;
  commissionRate?: number;
  paymentStatus?: LeadPaymentStatus;
  renewalDate?: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  category: string;
  totalCommission: number;
  monthlyCommission: number;
  pendingCommission: number;
  monthlySales: number;
  badge?: string;
  planId?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  roleId: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'product' | 'update' | 'maintenance' | 'general';
  author: string;
  authorRole: string;
  date: string;
  isPinned: boolean;
}

export interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetType: 'all_partners' | 'specific_partner' | 'all_employees' | 'specific_employee';
  targetId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  commissionEligible: boolean;
  showOnLanding: boolean;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  status: 'Active' | 'Beta' | 'Coming Soon';
  launchDate?: string;
  billingFrequency?: 'Monthly' | 'Yearly';
  gstApplicable?: boolean;
  gstRate?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'commission' | 'lead' | 'announcement' | 'payment' | 'system';
  date: string;
  read: boolean;
}

export interface LeaderboardEntry {
  partnerId: string;
  partnerName: string;
  company: string;
  metric: number;
  metricLabel: string;
  rank: number;
  badge: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface AppSettings {
  leadLockDays: number;
  commissionCapMonths: number;
  defaultCurrency: string;
}

export interface CommissionTransaction {
  id: string;
  partnerId: string;
  customerName: string;
  companyName: string;
  amount: number;
  rate: number;
  planTier: string;
  month: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Blocked';
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  amount: number;
  periodLabel: string;
  planType: PlanType;
  paymentDate: string;
  notes: string;
  recordedBy: string;
}

export interface SiteContent {
  // Landing page
  landingBadge: string;
  landingHeroTitle1: string;
  landingHeroTitle2: string;
  landingHeroTitle3: string;
  landingHeroSubtitle: string;
  landingCtaPrimary: string;
  landingCtaSecondary: string;
  landingNavSignIn: string;
  landingFeaturesLabel: string;
  landingFeaturesHeading: string;
  landingFeaturesSubheading: string;
  landingFeature1Title: string;
  landingFeature1Desc: string;
  landingFeature2Title: string;
  landingFeature2Desc: string;
  landingFeature3Title: string;
  landingFeature3Desc: string;
  landingFeature4Title: string;
  landingFeature4Desc: string;
  landingFeature5Title: string;
  landingFeature5Desc: string;
  landingFeature6Title: string;
  landingFeature6Desc: string;
  landingTrust1Label: string;
  landingTrust1Sub: string;
  landingTrust2Label: string;
  landingTrust2Sub: string;
  landingTrust3Label: string;
  landingTrust3Sub: string;
  landingEarningsLabel: string;
  landingEarningsHeading: string;
  landingEarningsDesc: string;
  landingEarningsBullet1: string;
  landingEarningsBullet2: string;
  landingEarningsBullet3: string;
  landingEarningsBullet4: string;
  landingCard1Label: string;
  landingCard1Value: string;
  landingCard1Trend: string;
  landingCard2Title: string;
  landingCard2Name: string;
  landingCard2Value: string;
  landingCard2Sub: string;
  landingCard3Label: string;
  landingCard3Value: string;
  landingCard3Sub: string;
  landingCard4Title: string;
  landingCard4Sub: string;
  landingHowItWorksLabel: string;
  landingHowItWorksHeading: string;
  landingStep1Title: string;
  landingStep1Desc: string;
  landingStep2Title: string;
  landingStep2Desc: string;
  landingStep3Title: string;
  landingStep3Desc: string;
  landingCtaSectionHeading: string;
  landingCtaSectionDesc: string;
  landingCtaSectionButton: string;
  landingStat1Value: string;
  landingStat1Label: string;
  landingStat2Value: string;
  landingStat2Label: string;
  landingStat3Value: string;
  landingStat3Label: string;
  landingStat4Value: string;
  landingStat4Label: string;
  landingFooterTagline: string;
  landingFooterSub: string;
  landingFooterCopyright: string;
  landingFooterPoweredBy: string;
  // Login page
  loginBadge: string;
  loginHeroTitle1: string;
  loginHeroTitle2: string;
  loginHeroSubtitle: string;
  loginFeature1Title: string;
  loginFeature1Desc: string;
  loginFeature2Title: string;
  loginFeature2Desc: string;
  loginFeature3Title: string;
  loginFeature3Desc: string;
  loginStat1Value: string;
  loginStat1Label: string;
  loginStat2Value: string;
  loginStat2Label: string;
  loginStat3Value: string;
  loginStat3Label: string;
  loginPartnerTitle: string;
  loginPartnerSubtitle: string;
  loginAdminTitle: string;
  loginAdminSubtitle: string;
  loginTabPartner: string;
  loginTabAdmin: string;
  loginMethodPassword: string;
  loginMethodOtp: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  loginOtpLabel: string;
  loginSignInButton: string;
  loginSendOtpButton: string;
  loginVerifyButton: string;
  loginChangeEmailButton: string;
  loginOtpSentPrefix: string;
  loginOtpSentSuffix: string;
  loginInstallButton: string;
  loginInstalledText: string;
  loginFooterPoweredBy: string;
  // Partner panel
  commissionRulesNotice: string;
  commissionFreeTitle: string;
  commissionFreeValue: string;
  commissionFreeDesc: string;
  commissionPremiumTitle: string;
  commissionPremiumValue: string;
  commissionPremiumDesc: string;
  commissionCapTitle: string;
  commissionCapValue: string;
  commissionCapDesc: string;
  // Partner panel — Plans & Features
  plansHeaderTitle: string;
  plansHeaderSubtitle: string;
  plansBannerHeading: string;
  plansBannerDesc: string;
  // Partner panel — Leaderboard & Badges
  leaderboardHeaderTitle: string;
  leaderboardHeaderSubtitle: string;
  leaderboardBadgeSystemTitle: string;
  leaderboardBadgeSystemDesc: string;
  leaderboardEmptyTitle: string;
  leaderboardEmptyMsg: string;
  // Partner panel — Products Suite
  productsHeaderTitle: string;
  productsHeaderSubtitle: string;
  productsBannerHeading: string;
  productsBannerDesc: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderType: 'partner' | 'support';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerCompany: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: string;
  lastMessageAt: string;
  unreadByPartner: number;
  unreadBySupport: number;
}
