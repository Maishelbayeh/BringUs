export const mockAffiliatePayments: Record<number, any[]> = {
  1: [
    { tremaining: 109480, paid: 45, date: '5/6/2025', balance: 109435 },
    { remaining: 110000, paid: 520, date: '5/6/2025', balance: 109480 },
    { remaining: 110430, paid: 430, date: '5/6/2025', balance: 110000 },
  ],
  2: [
    { remaining: 50000, paid: 100, date: '5/6/2025', balance: 49900 },
    { remaining: 49900, paid: 200, date: '5/7/2025', balance: 49700 },
  ],
  3: [
    { remaining: 20000, paid: 50, date: '5/6/2025', balance: 19950 },
  ],
};

export function getAffiliatePaymentsById(id: number): any[] {
  return mockAffiliatePayments[id] || [];
} 