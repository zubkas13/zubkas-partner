import { CheckCircle2, Sparkles, Briefcase, BarChart3, HardHat, CreditCard, Wallet, Users, Package } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';

const iconMap: Record<string, typeof Package> = {
  Briefcase, BarChart3, HardHat, CreditCard, Wallet, Users, Sparkles, Package,
};

function computeGstAmount(price: number, rate: number): number {
  return Math.round((price * (rate / 100)) * 100) / 100;
}

function formatINR(n: number | null | undefined): string {
  if (n == null) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

export function PartnerProducts() {
  const { products, siteContent } = useApp();

  return (
    <div className="space-y-6">
      <SectionHeader title={siteContent.productsHeaderTitle || 'Products Suite'} subtitle={siteContent.productsHeaderSubtitle || 'Zubkas products you can refer and earn commission on'} />

      <div className="rounded-xl bg-gradient-to-r from-zubkas-700 to-zubkas-800 p-6 text-white">
        <h3 className="font-display text-lg font-bold">{siteContent.productsBannerHeading || 'Earn Commission on Every Referral'}</h3>
        <p className="text-sm text-zubkas-100 mt-1">{siteContent.productsBannerDesc || 'Refer customers to any Zubkas product and earn up to 15% recurring commission for 12 months on monthly plans, or a one-time lump-sum on yearly plans.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => {
          const Icon = iconMap[p.icon] ?? Package;
          const hasMonthly = p.monthlyPrice != null;
          const hasYearly = p.yearlyPrice != null;
          const mGst = p.gstApplicable && hasMonthly ? computeGstAmount(p.monthlyPrice!, p.gstRate ?? 18) : null;
          const yGst = p.gstApplicable && hasYearly ? computeGstAmount(p.yearlyPrice!, p.gstRate ?? 18) : null;
          const mTotal = hasMonthly ? p.monthlyPrice! + (mGst ?? 0) : null;
          const yTotal = hasYearly ? p.yearlyPrice! + (yGst ?? 0) : null;
          return (
            <div key={p.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zubkas-50">
                  <Icon className="h-6 w-6 text-zubkas-700" />
                </div>
                <span className={`badge ${p.status === 'Active' ? 'badge-success' : p.status === 'Beta' ? 'badge-warning' : 'badge-neutral'}`}>{p.status}</span>
              </div>
              <h3 className="mt-3 font-display font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-1 text-sm text-gray-500 flex-1">{p.description}</p>
              <div className="mt-3 space-y-1.5">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Dual pricing block */}
              <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {/* Monthly */}
                  <div className={`rounded-lg border p-2.5 ${p.billingFrequency === 'Monthly' ? 'border-zubkas-200 bg-zubkas-50/40' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zubkas-700">Monthly</span>
                      {p.billingFrequency === 'Monthly' && <span className="text-[9px] rounded bg-zubkas-700 px-1 py-0.5 text-white font-semibold">Default</span>}
                    </div>
                    {hasMonthly ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Base</span>
                          <span className="font-medium text-gray-900">{formatINR(p.monthlyPrice)}</span>
                        </div>
                        {mGst != null && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">GST ({p.gstRate ?? 18}%)</span>
                            <span className="font-medium text-gray-700">{formatINR(mGst)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-gray-100">
                          <span className="text-gray-500 font-medium">Total</span>
                          <span className="font-semibold text-zubkas-700">{formatINR(mTotal)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">Not offered</span>
                    )}
                  </div>

                  {/* Yearly */}
                  <div className={`rounded-lg border p-2.5 ${p.billingFrequency === 'Yearly' ? 'border-zubkas-200 bg-zubkas-50/40' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zubkas-700">Yearly</span>
                      {p.billingFrequency === 'Yearly' && <span className="text-[9px] rounded bg-zubkas-700 px-1 py-0.5 text-white font-semibold">Default</span>}
                    </div>
                    {hasYearly ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Base</span>
                          <span className="font-medium text-gray-900">{formatINR(p.yearlyPrice)}</span>
                        </div>
                        {yGst != null && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">GST ({p.gstRate ?? 18}%)</span>
                            <span className="font-medium text-gray-700">{formatINR(yGst)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-gray-100">
                          <span className="text-gray-500 font-medium">Total</span>
                          <span className="font-semibold text-zubkas-700">{formatINR(yTotal)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">Not offered</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Commission</span>
                  {p.commissionEligible ? (
                    <span className="font-medium text-emerald-600">Eligible</span>
                  ) : (
                    <span className="text-gray-400">Not eligible</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
