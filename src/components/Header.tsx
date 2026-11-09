import { useState } from 'react';
import { Bell, Search, LogOut, Menu, ChevronDown, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getInitials, formatDate } from '@/utils/helpers';
import { useMergedNotifications } from '@/utils/useMergedNotifications';

const logoImg = '/assets/icons/zubkas_icon_hd_new.png';
const logoImgFallback = '/assets/icons/zubkas_icon_hd_white.png';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  onNotificationNavigate?: (page: string, announcementId?: string) => void;
}

export function Header({ onToggleSidebar, onNavigate, onNotificationNavigate }: HeaderProps) {
  const { currentUser, notifications, announcements, logout, markNotificationRead,
    readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds,
    setReadAnnouncementIds, setDismissedAnnouncementIds, setDismissedNotificationIds,
  } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!currentUser) return null;

  const { merged: userNotifs, unreadCount, markRead, markAllRead, dismiss } = useMergedNotifications(
    notifications, announcements, currentUser.id, currentUser.partnerId, currentUser.role,
    readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds,
    setReadAnnouncementIds, setDismissedAnnouncementIds, setDismissedNotificationIds,
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <img src={logoImg} alt="Zubkas" width={32} height={32} className="h-8 w-8 object-contain shrink-0" loading="eager" draggable={false} onError={(e) => { const t = e.currentTarget; if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = logoImgFallback; } }} />
          <p className="font-display text-sm font-bold text-gray-900">Zubkas</p>
        </div>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-zubkas-700 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zubkas-700 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white shadow-xl animate-slide-up">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h4 className="font-display font-semibold text-gray-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-zubkas-700 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                  ) : (
                    userNotifs.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        className={`group flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${!n.read ? 'bg-zubkas-50/40' : ''}`}
                      >
                        <button
                          onClick={() => {
                            if (!n.read) {
                              if (n.source === 'notification') markNotificationRead(n.id);
                              else markRead(n.id);
                            }
                            if (n.source === 'announcement' && n.announcementId && onNotificationNavigate) {
                              setNotifOpen(false);
                              onNotificationNavigate('announcements', n.announcementId);
                            } else if (n.type === 'announcement' && onNotificationNavigate) {
                              setNotifOpen(false);
                              onNotificationNavigate('announcements');
                            }
                          }}
                          className="flex flex-1 gap-3 text-left"
                        >
                          {!n.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zubkas-700" />}
                          <div className={n.read ? 'pl-5' : ''}>
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.date)}</p>
                          </div>
                        </button>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          title="Dismiss"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-[10px] text-gray-500 capitalize">{currentUser.role}{currentUser.employeeRole ? ` · ${currentUser.employeeRole}` : ''}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl animate-slide-up">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="font-medium text-gray-900 text-sm">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); onNavigate('profile'); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
