import type { Partner, Customer, Lead, CommissionTransaction } from '@/types';

export interface PartnerStats {
  monthlySales: number;
  totalCommission: number;
  monthlyCommission: number;
  pendingCommission: number;
}

/**
 * Compute a partner's sales and commission figures dynamically from
 * converted leads, customers, and paid transactions — rather than relying
 * on static stored values that never update when leads are converted.
 */
function leadCommission(l: Lead): number {
  const price = l.planPrice ?? 0;
  const rate = l.commissionRate ?? 0;
  return price * rate / 100;
}

export function computePartnerStats(
  partner: Partner,
  customers: Customer[],
  leads: Lead[],
  transactions: CommissionTransaction[],
): PartnerStats {
  const myCustomers = customers.filter(c => c.partnerId === partner.id);
  const myLeads = leads.filter(l => l.partnerId === partner.id);
  const myTxns = transactions.filter(t => t.partnerId === partner.id);

  const convertedLeads = myLeads.filter(l => l.status === 'Converted' || l.paymentStatus === 'Paid');

  // Monthly Sales: sum of plan prices from converted/paid leads + active customer subscriptions
  const convertedLeadSales = convertedLeads.reduce((sum, l) => sum + (l.planPrice ?? 0), 0);
  const activeCustomerSales = myCustomers
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.subscriptionAmount, 0);
  const monthlySales = convertedLeadSales + activeCustomerSales;

  // Commission from converted leads: planPrice * commissionRate / 100
  const convertedLeadCommission = convertedLeads.reduce((sum, l) => sum + leadCommission(l), 0);

  // Total Commission: converted lead commission + paid transactions + customer commission earned
  const paidTxnCommission = myTxns
    .filter(t => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const customerEarnedCommission = myCustomers.reduce((sum, c) => sum + c.commissionEarned, 0);
  const totalCommission = convertedLeadCommission + paidTxnCommission + customerEarnedCommission;

  // Monthly Commission: active earning customers + converted monthly leads not yet tracked as customers
  const customerMonthlyCommission = myCustomers
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => {
      if (c.planType === 'Monthly' && c.remainingMonths > 0) {
        return sum + (c.subscriptionAmount * c.commissionRate / 100);
      }
      if (c.planType === 'Yearly') {
        return sum + c.commissionEarned;
      }
      return sum;
    }, 0);

  // Include commission from converted monthly leads that don't have a linked customer yet
  const customerCompanyNames = new Set(myCustomers.map(c => c.companyName.toLowerCase()));
  const unlinkedMonthlyLeadCommission = convertedLeads
    .filter(l => l.planType === 'Monthly' && !customerCompanyNames.has(l.companyName.toLowerCase()))
    .reduce((sum, l) => sum + leadCommission(l), 0);

  const monthlyCommission = customerMonthlyCommission + unlinkedMonthlyLeadCommission;

  // Pending Commission: commission from unpaid customers
  const pendingCommission = myCustomers
    .filter(c => c.status === 'Unpaid')
    .reduce((sum, c) => sum + (c.subscriptionAmount * c.commissionRate / 100), 0);

  return { monthlySales, totalCommission, monthlyCommission, pendingCommission };
}

/**
 * Build a map of computed stats for all partners.
 */
export function computeAllPartnerStats(
  partners: Partner[],
  customers: Customer[],
  leads: Lead[],
  transactions: CommissionTransaction[],
): Record<string, PartnerStats> {
  const map: Record<string, PartnerStats> = {};
  for (const p of partners) {
    map[p.id] = computePartnerStats(p, customers, leads, transactions);
  }
  return map;
}

/**
 * Return a partner object with computed stats merged in, falling back to
 * stored values if computation yields zero (preserves seeded demo data).
 */
export function partnerWithStats(
  partner: Partner,
  statsMap: Record<string, PartnerStats>,
): Partner {
  const s = statsMap[partner.id];
  if (!s) return partner;
  return {
    ...partner,
    monthlySales: s.monthlySales > 0 ? s.monthlySales : partner.monthlySales,
    totalCommission: s.totalCommission > 0 ? s.totalCommission : partner.totalCommission,
    monthlyCommission: s.monthlyCommission > 0 ? s.monthlyCommission : partner.monthlyCommission,
    pendingCommission: s.pendingCommission > 0 ? s.pendingCommission : partner.pendingCommission,
  };
}