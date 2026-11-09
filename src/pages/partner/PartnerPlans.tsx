import { Layers, Percent, CircleCheck as CheckCircle2, Calendar, IndianRupee } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';

export function PartnerPlans() {
  const { plans, siteContent } = useApp();

  return (
    <div className="space-y-6">
      <SectionHeader
        title={siteContent.plansHeaderTitle || 'Plans & Features'}
        subtitle={siteContent.plansHeaderSubtitle || 'Subscription plans and commission rates available for your referrals'}
      />

      <div className="rounded-xl bg-gradient-to-r from-zubkas-700 to-zubkas-800 p-6 text-white">
        <h3 className="font-display text-lg font-bold">{siteContent.plansBannerHeading || 'Earn Commission on Every Referral'}</h3>
        <p className="text-sm text-zubkas-100 mt-1">{siteContent.plansBannerDesc || 'Refer customers to any Zubkas plan and earn recurring commission for up to 12 months on monthly plans, or a one-time lump-sum on yearly plans.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(p => {
          const basePrice = p.price ?? 0;
          const isFree = p.price == null || p.price === 0;
          const gstAmount = p.gstApplicable ? Math.round((basePrice * (p.gstRate ?? 18) / 100) * 100) / 100 : 0;
          const total = basePrice + gstAmount;
          return (
            <div key={p.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zubkas-50">
                  <Layers className="h-6 w-6 text-zubkas-700" />
                </div>
              </div>

              <h3 className="mt-3 font-display font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-1 text-sm text-gray-500 flex-1">{p.description}</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-5 w-5 text-gray-700" />
                  <span className="text-2xl font-bold text-gray-900">{isFree ? '0' : basePrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500">{p.type === 'Yearly' ? '/yr' : '/mo'}</span>
                </div>
                {isFree && <span className="text-xs font-semibold text-emerald-600">Free</span>}
                <div className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-zubkas-700" />
                  <span className="text-2xl font-bold text-zubkas-700">{p.commissionRate}%</span>
                </div>
                <span className="text-xs text-gray-500">commission</span>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{p.type} plan</span>
              </div>

              {p.gstApplicable && !isFree && (
                <div className="mt-3 space-y-1 pt-2 border-t border-gray-50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Base Price</span>
                    <span className="font-medium text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">GST ({p.gstRate ?? 18}%)</span>
                    <span className="font-medium text-gray-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total (incl. GST)</span>
                    <span className="font-semibold text-zubkas-700">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {p.features && p.features.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
