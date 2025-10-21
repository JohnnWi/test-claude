import { startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, parseISO, format } from 'date-fns';

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

// Funzione generica per aggregare dati
export const getAggregatedData = (purchases, aggregationType = 'month') => {
  const aggregatedData = {};
  const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  purchases.forEach(p => {
    const date = parseISO(p.date);
    let key, label;

    if (aggregationType === 'week') {
      // Settimana: formato "W1 2025", "W2 2025"
      const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
      const weekNumber = Math.ceil((date.getDate() - startOfWeekDate.getDate()) / 7) + 1;
      const weekInYear = format(date, 'w');
      key = `${date.getFullYear()}-W${weekInYear.padStart(2, '0')}`;
      label = `Sett ${weekInYear} ${date.getFullYear()}`;
    } else if (aggregationType === 'month') {
      // Mese: formato "Gen 2025"
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      label = `${monthNames[monthIndex]} ${year}`;
    } else if (aggregationType === 'year') {
      // Anno: formato "2025"
      key = `${date.getFullYear()}`;
      label = `${date.getFullYear()}`;
    } else {
      // All: raggruppa tutto
      key = 'total';
      label = 'Totale';
    }

    if (!aggregatedData[key]) {
      aggregatedData[key] = {
        sortKey: key,
        label: label,
        total: 0
      };
    }
    aggregatedData[key].total += parseFloat(p.price);
  });

  return Object.values(aggregatedData)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, total }) => ({
      month: label,  // Manteniamo il nome "month" per compatibilità con il grafico
      total: parseFloat(total.toFixed(2))
    }));
};

// Retrocompatibilità
export const getMonthlyData = (purchases) => {
  return getAggregatedData(purchases, 'month');
};
