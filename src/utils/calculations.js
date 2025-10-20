import { startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, parseISO } from 'date-fns';

export const filterPurchasesByPeriod = (purchases, period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      break;
    default:
      return purchases;
  }

  return purchases.filter(p => {
    const purchaseDate = parseISO(p.date);
    return isAfter(purchaseDate, startDate) || purchaseDate.getTime() === startDate.getTime();
  });
};

export const calculateTotal = (purchases) => {
  return purchases.reduce((sum, p) => sum + parseFloat(p.price), 0);
};

export const calculateByPlatform = (purchases) => {
  const byPlatform = {};
  purchases.forEach(p => {
    if (!byPlatform[p.platform]) {
      byPlatform[p.platform] = { total: 0, count: 0 };
    }
    byPlatform[p.platform].total += parseFloat(p.price);
    byPlatform[p.platform].count += 1;
  });
  return byPlatform;
};

export const getMonthlyData = (purchases) => {
  const monthlyData = {};

  purchases.forEach(p => {
    const date = parseISO(p.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey] += parseFloat(p.price);
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2))
    }));
};
