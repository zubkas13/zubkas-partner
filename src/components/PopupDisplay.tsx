import { useState, useEffect, useMemo } from 'react';
import { X, Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePersistentState } from '@/utils/usePersistentState';
import type { Popup, User } from '@/types';

function isPopupForUser(popup: Popup, user: User): boolean {
  if (!popup.isActive) return false;
  if (user.role === 'partner') {
    if (popup.targetType === 'all_partners') return true;
    if (popup.targetType === 'specific_partner') return popup.targetId === user.partnerId;
    return false;
  }
  if (user.role === 'employee') {
    if (popup.targetType === 'all_employees') return true;
    if (popup.targetType === 'specific_employee') return popup.targetId === user.id;
    return false;
  }
  return false;
}

export function PopupDisplay() {
  const { popups, currentUser, dataLoaded } = useApp();
  const [dismissedPopupIds, setDismissedPopupIds] = usePersistentState<string[]>('zubkas_dismissed_popups', []);
  const [activeIndex, setActiveIndex] = useState(0);

  const relevantPopups = useMemo(() => {
    if (!currentUser || !dataLoaded) return [];
    return popups
      .filter(p => isPopupForUser(p, currentUser))
      .filter(p => !dismissedPopupIds.includes(p.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [popups, currentUser, dataLoaded, dismissedPopupIds]);

  const currentPopup = relevantPopups[activeIndex];

  useEffect(() => {
    if (activeIndex >= relevantPopups.length) {
      setActiveIndex(0);
    }
  }, [relevantPopups.length, activeIndex]);

  if (!currentPopup) return null;

  const dismiss = () => {
    setDismissedPopupIds(prev => [...prev, currentPopup.id]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={dismiss}>
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-white/80 backdrop-blur text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {currentPopup.imageUrl && (
          <div className="w-full h-48 overflow-hidden bg-gray-100">
            <img
              src={currentPopup.imageUrl}
              alt={currentPopup.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zubkas-50">
              <Bell className="h-4 w-4 text-zubkas-700" />
            </div>
            <span className="text-xs font-medium text-zubkas-700 uppercase tracking-wide">Announcement</span>
          </div>

          <h2 className="font-display text-xl font-bold text-gray-900">{currentPopup.title}</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{currentPopup.content}</p>

          {relevantPopups.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {relevantPopups.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-zubkas-700' : 'w-1.5 bg-gray-300'}`} />
              ))}
            </div>
          )}

          <button
            onClick={dismiss}
            className="btn-primary w-full mt-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
