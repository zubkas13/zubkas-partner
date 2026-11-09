import { useState, useEffect, useMemo } from 'react';
import { usePersistentState } from '@/utils/usePersistentState';
import { LayoutDashboard, Users, Settings, FolderTree, Layers, Megaphone, Trophy, Target, Bell, User as UserIcon, DollarSign, Package, CircleUser as UserCircle, Type, ShieldCheck, MessageSquare as Popups, History, PlusCircle } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminPartners } from '@/pages/admin/AdminPartners';
import { AdminEmployees } from '@/pages/admin/AdminEmployees';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminPlans } from '@/pages/admin/AdminPlans';
import { AdminLeads } from '@/pages/admin/AdminLeads';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminAnnouncements } from '@/pages/admin/AdminAnnouncements';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminLeaderboard } from '@/pages/admin/AdminLeaderboard';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminContentManager } from '@/pages/admin/AdminContentManager';
import { AdminProfile } from '@/pages/admin/AdminProfile';
import { AdminRoles } from '@/pages/admin/AdminRoles';
import { AdminPopups } from '@/pages/admin/AdminPopups';
import { AdminAddRecords } from '@/pages/admin/AdminAddRecords';
import { AdminViewHistory } from '@/pages/admin/AdminViewHistory';

// Partner pages
import { PartnerDashboard } from '@/pages/partner/PartnerDashboard';
import { PartnerCustomers } from '@/pages/partner/PartnerCustomers';
import { PartnerLeads } from '@/pages/partner/PartnerLeads';
import { PartnerCommissions } from '@/pages/partner/PartnerCommissions';
import { PartnerProducts } from '@/pages/partner/PartnerProducts';
import { PartnerAnnouncements } from '@/pages/partner/PartnerAnnouncements';
import { PartnerLeaderboard } from '@/pages/partner/PartnerLeaderboard';
import { PartnerPlans } from '@/pages/partner/PartnerPlans';
import { PartnerProfile } from '@/pages/partner/PartnerProfile';
import { PopupDisplay } from '@/components/PopupDisplay';

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'partners', label: 'Partners', icon: Users },
  { key: 'leads', label: 'Leads', icon: Target },
  { key: 'customers', label: 'Customers', icon: Users, children: [
    { key: 'customer-payments', label: 'Add Records', icon: PlusCircle },
    { key: 'customer-history', label: 'View History', icon: History },
  ] },
  { key: 'employees', label: 'Employees', icon: UserIcon },
  { key: 'categories', label: 'Categories', icon: FolderTree },
  { key: 'plans', label: 'Plans & Rates', icon: Layers },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'content', label: 'Content Manager', icon: Type },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'popups', label: 'Popups', icon: Popups },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'profile', label: 'My Profile', icon: UserCircle },
];

const partnerNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'customers', label: 'My Customers', icon: Users },
  { key: 'leads', label: 'My Leads', icon: Target },
  { key: 'commissions', label: 'Commissions', icon: DollarSign },
  { key: 'plans', label: 'Plans & Features', icon: Layers },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { key: 'profile', label: 'My Profile', icon: UserCircle },
];

function AdminPortal() {
  const { currentUser, notifications, announcements, readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds, hasPermission } = useApp();
  const [page, setPage] = usePersistentState<string>('zubkas_admin_page', 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = useMemo(() => {
    const unreadNotifs = notifications.filter(n =>
      !dismissedNotificationIds.includes(n.id) &&
      !n.read &&
      (n.userId === 'admin' || n.userId === 'broadcast')
    ).length;
    const unreadAnnouncements = announcements.filter(a =>
      !dismissedAnnouncementIds.includes(a.id) &&
      !readAnnouncementIds.includes(a.id)
    ).length;
    return unreadNotifs + unreadAnnouncements;
  }, [notifications, announcements, dismissedNotificationIds, dismissedAnnouncementIds, readAnnouncementIds]);

  const allItems = adminNavItems.map(item =>
    item.key === 'announcements' ? { ...item, badge: unreadCount } : item
  );

  const items = allItems.filter(item =>
    item.key === 'profile' || hasPermission(item.key as import('@/types').AdminSectionKey)
  );

  const firstAccessibleKey = items[0]?.key ?? 'dashboard';
  const activePage = (items.some(item => item.key === page) || items.some(item => item.children?.some(c => c.key === page))) ? page : firstAccessibleKey;

  useEffect(() => {
    if (!items.some(item => item.key === page) && !items.some(item => item.children?.some(c => c.key === page)) && page !== firstAccessibleKey) {
      setPage(firstAccessibleKey);
    }
  }, [items, page, firstAccessibleKey, setPage]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <AdminDashboard />;
      case 'partners': return <AdminPartners />;
      case 'leads': return <AdminLeads />;
      case 'customers': return <AdminCustomers />;
      case 'customer-payments': return <AdminAddRecords />;
      case 'customer-history': return <AdminViewHistory />;
      case 'employees': return <AdminEmployees />;
      case 'categories': return <AdminCategories />;
      case 'plans': return <AdminPlans />;
      case 'products': return <AdminProducts />;
      case 'announcements': return <AdminAnnouncements />;
      case 'leaderboard': return <AdminLeaderboard />;
      case 'settings': return <AdminSettings />;
      case 'content': return <AdminContentManager />;
      case 'roles': return <AdminRoles />;
      case 'popups': return <AdminPopups />;
      case 'profile': return <AdminProfile />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AppLayout
      sidebarItems={items}
      activePage={activePage}
      onNavigate={setPage}
      userName={currentUser?.name ?? ''}
      userRole={currentUser?.role === 'admin' ? 'Administrator' : currentUser?.employeeRole ?? 'Employee'}
      variant={currentUser?.role === 'employee' ? 'employee' : 'admin'}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {renderPage()}
      <PopupDisplay />
    </AppLayout>
  );
}

function PartnerPortal() {
  const {
    currentUser, notifications, announcements,
    readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds,
  } = useApp();
  const [page, setPage] = usePersistentState<string>('zubkas_partner_page', 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightAnnouncementId, setHighlightAnnouncementId] = useState<string | null>(null);

  // Compute unread count the same way the Header dropdown does — accounting
  // for dismissed notifications AND unread, non-dismissed announcements.
  const unreadCount = useMemo(() => {
    const unreadNotifs = notifications.filter(n =>
      !dismissedNotificationIds.includes(n.id) &&
      !n.read &&
      (n.userId === currentUser?.partnerId || n.userId === 'broadcast')
    ).length;
    const unreadAnnouncements = announcements.filter(a =>
      !dismissedAnnouncementIds.includes(a.id) &&
      !readAnnouncementIds.includes(a.id)
    ).length;
    return unreadNotifs + unreadAnnouncements;
  }, [notifications, announcements, dismissedNotificationIds, dismissedAnnouncementIds, readAnnouncementIds, currentUser?.partnerId]);

  const items = partnerNavItems.map(item =>
    item.key === 'announcements' ? { ...item, badge: unreadCount } : item
  );

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <PartnerDashboard />;
      case 'customers': return <PartnerCustomers />;
      case 'leads': return <PartnerLeads />;
      case 'commissions': return <PartnerCommissions />;
      case 'plans': return <PartnerPlans />;
      case 'products': return <PartnerProducts />;
      case 'announcements': return <PartnerAnnouncements highlightId={highlightAnnouncementId} />;
      case 'leaderboard': return <PartnerLeaderboard />;
      case 'profile': return <PartnerProfile />;
      default: return <PartnerDashboard />;
    }
  };

  return (
    <AppLayout
      sidebarItems={items}
      activePage={page}
      onNavigate={setPage}
      onNotificationNavigate={(targetPage, annId) => {
        setPage(targetPage);
        if (annId) setHighlightAnnouncementId(annId);
      }}
      userName={currentUser?.name ?? ''}
      userRole="Partner"
      variant="partner"
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {renderPage()}
      <PopupDisplay />
    </AppLayout>
  );
}

function AppContent() {
  const { currentUser, logout } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem('zubkas_admin_page');
      localStorage.removeItem('zubkas_partner_page');
    }
  }, [currentUser]);

  if (!currentUser && !showLogin) return <LandingPage onSignIn={() => setShowLogin(true)} />;
  if (!currentUser && showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  if (currentUser!.role === 'admin' || currentUser!.role === 'employee') return <AdminPortal />;
  return <PartnerPortal />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
