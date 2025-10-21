import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

const PLATFORM_COLORS = {
  Amazon: { bg: 'bg-orange-500', border: 'border-orange-500', ring: 'ring-orange-400' },
  AliExpress: { bg: 'bg-red-500', border: 'border-red-500', ring: 'ring-red-400' },
  Altro: { bg: 'bg-purple-500', border: 'border-purple-500', ring: 'ring-purple-400' }
};

export default function MiniCalendar({ purchases }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

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

  // Ottieni tutti gli acquisti del giorno selezionato
  const selectedDayPurchases = selectedDay ? getPurchasesForDay(selectedDay) : [];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    const dayPurchases = getPurchasesForDay(day);
    if (dayPurchases.length > 0) {
      setSelectedDay(isSameDay(day, selectedDay || new Date('1900-01-01')) ? null : day);
    }
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
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          // Raggruppa per piattaforma
          const platformCounts = dayPurchases.reduce((acc, p) => {
            acc[p.platform] = (acc[p.platform] || 0) + 1;
            return acc;
          }, {});

          // Piattaforma dominante (quella con più acquisti)
          const dominantPlatform = Object.entries(platformCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0];

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              disabled={!hasPurchases}
              className={`
                aspect-square flex items-center justify-center rounded-full text-xs transition-all relative
                ${hasPurchases
                  ? `cursor-pointer hover:scale-110 font-bold border-2 ${PLATFORM_COLORS[dominantPlatform]?.border}`
                  : 'cursor-default text-gray-400 border-2 border-transparent'}
                ${isSelected
                  ? `${PLATFORM_COLORS[dominantPlatform]?.bg} text-white scale-110 shadow-lg ring-2 ${PLATFORM_COLORS[dominantPlatform]?.ring}`
                  : hasPurchases
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : ''}
              `}
            >
              <span className={`${isSelected ? 'text-white font-bold' : hasPurchases ? 'text-gray-800' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </span>

              {/* Badge con numero acquisti */}
              {hasPurchases && dayPurchases.length > 1 && (
                <span className={`absolute -top-0.5 -right-0.5 text-[8px] font-bold px-1 min-w-[14px] text-center rounded-full ${
                  isSelected ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
                }`}>
                  {dayPurchases.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
