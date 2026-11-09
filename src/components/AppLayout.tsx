import { type ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { type LucideIcon } from 'lucide-react';

interface NavChild {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface AppLayoutProps {
  sidebarItems: { key: string; label: string; icon: LucideIcon; badge?: number; children?: NavChild[] }[];
  activePage: string;
  onNavigate: (page: string) => void;
  onNotificationNavigate?: (page: string, announcementId?: string) => void;
  userName: string;
  userRole: string;
  variant: 'admin' | 'employee' | 'partner';
  children: ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

export function AppLayout({
  sidebarItems, activePage, onNavigate, onNotificationNavigate, userName, userRole, variant, children,
  sidebarOpen, onToggleSidebar, onCloseSidebar,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        active={activePage}
        onNavigate={onNavigate}
        open={sidebarOpen}
        onClose={onCloseSidebar}
        userName={userName}
        userRole={userRole}
        variant={variant}
      />
      <div className="lg:pl-64">
        <Header onToggleSidebar={onToggleSidebar} onNavigate={onNavigate} onNotificationNavigate={onNotificationNavigate} />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
