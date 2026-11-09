import { Crown, Star, Award, Rocket, Target, Trophy, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { getInitials } from '@/utils/helpers';
import { calculateLeaderboard, calculatePartnerBadge, getBadges } from '@/utils/badges';

const iconMap: Record<string, typeof Crown> = {
  Trophy, TrendingUp, Target, Rocket, Crown, Star, Award,
};

const badgeIcons: Record<string, typeof Crown> = { 'Top Performer': Crown, 'Rising Star': Star, 'Consistent Earner': Award, 'New Champion': Rocket, 'Lead Master': Target };

export function PartnerLeaderboard() {
  const { currentUser, partners, customers, leads, transactions, siteContent } = useApp();
  const partner = partners.find(p => p.id === currentUser?.partnerId);

  const badges = getBadges();
  const sections = calculateLeaderboard(partners, customers, leads, transactions);
  const myBadge = partner ? calculatePartnerBadge(partner, customers, leads, transactions, partners) : '';

  return (
    <div className="space-y-6">
      <SectionHeader title={siteContent.leaderboardHeaderTitle || 'Leaderboard & Badges'} subtitle={siteContent.leaderboardHeaderSubtitle || 'See how you rank among all partners'} />

      {/* My rank */}
      {partner && (
        <div className="card p-5 bg-gradient-to-r from-zubkas-50 to-white border-zubkas-200">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zubkas-700 text-lg font-bold text-white">
              {getInitials(partner.name)}
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-gray-900">{partner.name}</p>
              <p className="text-sm text-gray-500">{partner.company}</p>
            </div>
            {myBadge && (() => { const Icon = badgeIcons[myBadge] ?? Trophy; return (
              <div className="flex items-center gap-2 rounded-full bg-zubkas-700 px-4 py-2 text-sm font-medium text-white">
                <Icon className="h-4 w-4" />
                {myBadge}
              </div>
            ); })()}
          </div>
        </div>
      )}

      {/* Badges legend */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-gray-900 mb-3">{siteContent.leaderboardBadgeSystemTitle || 'Badge System'}</h3>
        <p className="text-xs text-gray-500 mb-3">{siteContent.leaderboardBadgeSystemDesc || 'Badges are earned automatically when you reach milestones. Keep growing to unlock them!'}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map(b => {
            const Icon = badgeIcons[b.name] ?? Award;
            return (
              <div key={b.id} className="flex items-start gap-3 rounded-lg border border-gray-50 p-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 ${b.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard sections */}
      {sections.map(section => {
        const Icon = iconMap[section.iconName] ?? Trophy;
        return (
          <div key={section.key} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
                <Icon className="h-5 w-5 text-zubkas-700" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900">{section.title}</h3>
                <p className="text-xs text-gray-500">{section.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2">
              {section.entries.length === 0 ? (
                <EmptyState icon={Trophy} title={siteContent.leaderboardEmptyTitle || 'No data yet'} message={siteContent.leaderboardEmptyMsg || 'Partners will appear here once they have activity'} />
              ) : (
                section.entries.map((entry, i) => {
                  const isMe = entry.partnerId === currentUser?.partnerId;
                  const BadgeIcon = badgeIcons[entry.badge] ?? null;
                  return (
                    <div key={entry.partnerId} className={`flex items-center gap-4 rounded-lg p-3 ${isMe ? 'bg-zubkas-50 border-2 border-zubkas-300' : i === 0 ? 'bg-gradient-to-r from-amber-50 to-transparent border border-amber-100' : 'bg-gray-50'}`}>
                      {isMe && <span className="badge badge-zubkas shrink-0">YOU</span>}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        #{entry.rank}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                        {getInitials(entry.partnerName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{entry.partnerName}</p>
                        <p className="text-xs text-gray-500 truncate">{entry.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{entry.metricLabel}</p>
                      </div>
                      {BadgeIcon && <BadgeIcon className={`h-5 w-5 ${i === 0 ? 'text-amber-500' : 'text-zubkas-700'}`} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
