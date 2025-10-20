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
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CalendarIcon className="text-blue-600" size={24} />
        Calendario
      </h3>

      {/* Header con navigazione mese */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Mese precedente"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <h4 className="text-lg font-bold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h4>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Mese successivo"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Legenda piattaforme */}
      <div className="flex gap-2 mb-3 flex-wrap justify-center">
        {Object.entries(PLATFORM_COLORS).map(([platform, colors]) => (
          <div key={platform} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${colors.bg}`}></div>
            <span className="text-[10px] text-gray-600">{platform}</span>
          </div>
        ))}
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => (
          <div key={index} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Giorni del mese */}
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative
                ${hasPurchases
                  ? 'cursor-pointer hover:scale-110 font-semibold'
                  : 'cursor-default text-gray-400'}
                ${isSelected
                  ? `${PLATFORM_COLORS[dominantPlatform]?.bg} text-white scale-110 shadow-lg`
                  : hasPurchases
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : ''}
              `}
            >
              <span className={isSelected ? 'text-white' : 'text-gray-800'}>
                {format(day, 'd')}
              </span>

              {/* Indicatori colorati per piattaforme */}
              {hasPurchases && !isSelected && (
                <div className="flex gap-0.5 mt-0.5">
                  {Object.keys(platformCounts).map(platform => (
                    <div
                      key={platform}
                      className={`w-1.5 h-1.5 rounded-full ${PLATFORM_COLORS[platform]?.bg}`}
                      title={`${platform}: ${platformCounts[platform]}`}
                    />
                  ))}
                </div>
              )}

              {/* Badge con numero acquisti */}
              {hasPurchases && dayPurchases.length > 1 && (
                <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1 rounded-full ${
                  isSelected ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
                }`}>
                  {dayPurchases.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Statistiche del mese corrente */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-medium mb-1">Acquisti</p>
            <p className="text-2xl font-bold text-blue-800">
              {purchases.filter(p => isSameMonth(parseISO(p.date), currentMonth)).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 font-medium mb-1">Spesa</p>
            <p className="text-2xl font-bold text-green-800">
              €{purchases
                .filter(p => isSameMonth(parseISO(p.date), currentMonth))
                .reduce((sum, p) => sum + p.price, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
