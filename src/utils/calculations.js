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
      // Settimana: formato "1-7 Gen 2025"
      const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
      const endOfWeekDate = new Date(startOfWeekDate);
      endOfWeekDate.setDate(endOfWeekDate.getDate() + 6);

      const weekInYear = format(date, 'w');
      key = `${date.getFullYear()}-W${weekInYear.padStart(2, '0')}`;

      // Ottieni il mese abbreviato (Gen, Feb, ecc.)
      const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      const monthName = monthNames[startOfWeekDate.getMonth()];

      // Formato: "1-7 Gen 2025"
      const startDay = startOfWeekDate.getDate();
      const endDay = endOfWeekDate.getDate();
      const year = startOfWeekDate.getFullYear();

      label = `${startDay}-${endDay} ${monthName} ${year}`;
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

// Distribuzione per fasce di prezzo
export const getPriceRangeDistribution = (purchases) => {
  const ranges = [
    { min: 0, max: 10, label: '0-10€' },
    { min: 10, max: 25, label: '10-25€' },
    { min: 25, max: 50, label: '25-50€' },
    { min: 50, max: 75, label: '50-75€' },
    { min: 75, max: 125, label: '75-125€' },
    { min: 125, max: 200, label: '125-200€' },
    { min: 200, max: 350, label: '200-350€' },
    { min: 350, max: 500, label: '350-500€' },
    { min: 500, max: 750, label: '500-750€' },
    { min: 750, max: 1000, label: '750-1000€' },
    { min: 1000, max: Infinity, label: '+1000€' }
  ];

  const distribution = ranges.map(range => ({
    range: range.label,
    count: 0,
    total: 0
  }));

  purchases.forEach(p => {
    const price = parseFloat(p.price);
    const rangeIndex = ranges.findIndex(r => price >= r.min && price < r.max);
    if (rangeIndex !== -1) {
      distribution[rangeIndex].count += 1;
      distribution[rangeIndex].total += price;
    }
  });

  return distribution.map(d => ({
    ...d,
    total: parseFloat(d.total.toFixed(2))
  }));
};

// Frequenza acquisti nel tempo
export const getPurchaseFrequency = (purchases, aggregationType = 'month') => {
  const aggregatedData = {};
  const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  purchases.forEach(p => {
    const date = parseISO(p.date);
    let key, label;

    if (aggregationType === 'week') {
      const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
      const endOfWeekDate = new Date(startOfWeekDate);
      endOfWeekDate.setDate(endOfWeekDate.getDate() + 6);
      const weekInYear = format(date, 'w');
      key = `${date.getFullYear()}-W${weekInYear.padStart(2, '0')}`;
      const monthName = monthNames[startOfWeekDate.getMonth()];
      const startDay = startOfWeekDate.getDate();
      const endDay = endOfWeekDate.getDate();
      const year = startOfWeekDate.getFullYear();
      label = `${startDay}-${endDay} ${monthName} ${year}`;
    } else if (aggregationType === 'month') {
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      label = `${monthNames[monthIndex]} ${year}`;
    } else if (aggregationType === 'year') {
      key = `${date.getFullYear()}`;
      label = `${date.getFullYear()}`;
    } else {
      key = 'total';
      label = 'Totale';
    }

    if (!aggregatedData[key]) {
      aggregatedData[key] = {
        sortKey: key,
        label: label,
        count: 0
      };
    }
    aggregatedData[key].count += 1;
  });

  return Object.values(aggregatedData)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, count }) => ({
      period: label,
      count: count
    }));
};

// Acquisti per giorno della settimana
export const getPurchasesByDayOfWeek = (purchases) => {
  const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  const byDay = daysOfWeek.map(day => ({ day, count: 0, total: 0 }));

  purchases.forEach(p => {
    const date = parseISO(p.date);
    const dayIndex = date.getDay();
    // Converti da domenica=0 a lunedì=0 (formato italiano)
    const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    byDay[adjustedDayIndex].count += 1;
    byDay[adjustedDayIndex].total += parseFloat(p.price);
  });

  return byDay.map(d => ({
    ...d,
    total: parseFloat(d.total.toFixed(2))
  }));
};
