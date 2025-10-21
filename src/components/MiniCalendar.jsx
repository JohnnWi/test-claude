import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

const PLATFORM_COLORS = {
  Amazon: {
    bg: 'from-orange-400 to-orange-600',
    shadow: 'shadow-orange-300',
    text: 'text-orange-700'
  },
  AliExpress: {
    bg: 'from-red-400 to-red-600',
    shadow: 'shadow-red-300',
    text: 'text-red-700'
  },
  Altro: {
    bg: 'from-purple-400 to-purple-600',
    shadow: 'shadow-purple-300',
    text: 'text-purple-700'
  }
};

export default function MiniCalendar({ purchases }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Ottieni il primo giorno della settimana (0 = domenica, 1 = lunedì, ecc.)
  const firstDayOfMonth = monthStart.getDay();
  // Converti da domenica=0 a lunedì=0 (formato italiano)
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Trova gli acquisti per giorno
  const getPurchasesForDay = (day) => {
    return purchases.filter(purchase =>
      isSameDay(parseISO(purchase.date), day)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
        <CalendarIcon className="text-blue-600" size={18} />
        Calendario
      </h3>

      {/* Header con navigazione mese */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Mese precedente"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>

        <h4 className="text-sm font-bold text-gray-800 capitalize">
          {format(currentMonth, 'MMM yyyy', { locale: it })}
        </h4>

        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Mese successivo"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => (
          <div key={index} className="text-center text-[10px] font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Giorni del mese */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Padding per allineare il primo giorno */}
        {Array.from({ length: startPadding }).map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square" />
        ))}

        {/* Giorni del mese */}
        {daysInMonth.map((day) => {
          const dayPurchases = getPurchasesForDay(day);
          const hasPurchases = dayPurchases.length > 0;

          // Raggruppa per piattaforma
          const platformCounts = dayPurchases.reduce((acc, p) => {
            acc[p.platform] = (acc[p.platform] || 0) + 1;
            return acc;
          }, {});

          // Piattaforma dominante (quella con più acquisti)
          const dominantPlatform = Object.entries(platformCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0];

          const colors = PLATFORM_COLORS[dominantPlatform];

          return (
            <div
              key={day.toISOString()}
              className="aspect-square flex items-center justify-center relative"
            >
              {hasPurchases ? (
                <div className={`
                  w-full h-full rounded-full flex items-center justify-center
                  bg-gradient-to-br ${colors?.bg}
                  shadow-lg ${colors?.shadow}
                  transform transition-transform hover:scale-105
                `}>
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {format(day, 'd')}
                  </span>

                  {/* Badge con numero acquisti */}
                  {dayPurchases.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-white text-gray-800 text-[9px] font-bold px-1.5 min-w-[16px] text-center rounded-full shadow-md border border-gray-200">
                      {dayPurchases.length}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">
                  {format(day, 'd')}
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
