import { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ShoppingBag, Euro, Calendar, Plus, Filter } from 'lucide-react';
import { calculateTotal, calculateByPlatform, getAggregatedData, filterPurchasesByPeriod, getPriceRangeDistribution, getPurchaseFrequency, getPurchasesByDayOfWeek } from '../utils/calculations';
import MiniCalendar from './MiniCalendar';

const COLORS = {
  Amazon: '#FF9900',
  AliExpress: '#E62E04',
  Altro: '#6366f1'
};

// Custom Tooltip elegante
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">€{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip per conteggio (senza €)
const CustomTooltipCount = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Label per Pie Chart
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard({ purchases, onOpenAddModal }) {
  const [period, setPeriod] = useState('all');
  const [trendPeriod, setTrendPeriod] = useState('month'); // Filtro per grafico trend

  const filteredPurchases = period === 'all' ? purchases : filterPurchasesByPeriod(purchases, period);

  const total = calculateTotal(filteredPurchases);
  const byPlatform = calculateByPlatform(filteredPurchases);
  const trendData = getAggregatedData(filteredPurchases, trendPeriod);
  const priceRangeData = getPriceRangeDistribution(filteredPurchases);
  const frequencyData = getPurchaseFrequency(filteredPurchases, trendPeriod);
  const dayOfWeekData = getPurchasesByDayOfWeek(filteredPurchases);

  const platformData = Object.entries(byPlatform).map(([platform, data]) => ({
    name: platform,
    value: parseFloat(data.total.toFixed(2)),
    count: data.count,
    fill: COLORS[platform] || '#6366f1'
  }));

  const periodLabels = {
    all: 'Totale',
    year: 'Quest\'anno',
    month: 'Questo mese',
    week: 'Questa settimana'
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Filter and Quick Add */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Periodo:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tutto' },
                { value: 'year', label: 'Anno' },
                { value: 'month', label: 'Mese' },
                { value: 'week', label: 'Settimana' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                    period === p.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            <Plus size={20} />
            Aggiungi Acquisto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Spesa Totale</p>
              <p className="text-4xl font-bold mt-2">€{total.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-2">{periodLabels[period]}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Euro size={40} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Acquisti</p>
              <p className="text-4xl font-bold mt-2">{filteredPurchases.length}</p>
              <p className="text-green-100 text-xs mt-2">{periodLabels[period]}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingBag size={40} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Media Acquisto</p>
              <p className="text-4xl font-bold mt-2">
                €{filteredPurchases.length > 0 ? (total / filteredPurchases.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-purple-100 text-xs mt-2">Per ordine</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp size={40} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Piattaforme</p>
              <p className="text-4xl font-bold mt-2">{Object.keys(byPlatform).length}</p>
              <p className="text-orange-100 text-xs mt-2">Utilizzate</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar size={40} className="opacity-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      {filteredPurchases.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-red-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Statistiche Aggiuntive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 border-2 border-green-300 dark:border-green-600 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Acquisto più Economico
              </p>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300 my-2">
                €{Math.min(...filteredPurchases.map(p => p.price)).toFixed(2)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {filteredPurchases.find(p => p.price === Math.min(...filteredPurchases.map(p => p.price)))?.name}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 border-2 border-red-300 dark:border-red-600 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Acquisto più Costoso
              </p>
              <p className="text-3xl font-bold text-red-800 dark:text-red-300 my-2">
                €{Math.max(...filteredPurchases.map(p => p.price)).toFixed(2)}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {filteredPurchases.find(p => p.price === Math.max(...filteredPurchases.map(p => p.price)))?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {Object.keys(byPlatform).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Dettaglio per Piattaforma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(byPlatform).map(([platform, data]) => (
              <div
                key={platform}
                className="border-2 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-2xl bg-white dark:bg-gray-700"
                style={{ borderColor: COLORS[platform] || '#6366f1' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{platform}</h4>
                  <div
                    className="w-6 h-6 rounded-full shadow-md"
                    style={{ backgroundColor: COLORS[platform] || '#6366f1' }}
                  />
                </div>
                <p className="text-3xl font-bold mb-2" style={{ color: COLORS[platform] || '#6366f1' }}>
                  €{data.total.toFixed(2)}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{data.count} acquisti</span>
                  <span className="font-medium">Avg: €{(data.total / data.count).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 6 + Mini Calendar Row */}
      {filteredPurchases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 6 Acquisti */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              Top 6 Acquisti
            </h3>
            <div className="space-y-3">
              {filteredPurchases
                .sort((a, b) => b.price - a.price)
                .slice(0, 6)
                .map((purchase, index) => {
                  const maxPrice = Math.max(...filteredPurchases.map(p => p.price));
                  const percentage = (purchase.price / maxPrice) * 100;
                  return (
                    <div key={purchase.id} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                            {purchase.name}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          €{purchase.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000`}
                          style={{
                            width: `${percentage}%`,
                            background: COLORS[purchase.platform] || '#6366f1'
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${
                        purchase.platform === 'Amazon' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                        purchase.platform === 'AliExpress' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      }`}>
                        {purchase.platform}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar purchases={filteredPurchases} />
        </div>
      )}

      {/* Charts */}
      {filteredPurchases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend temporale */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                Andamento Spese
              </h3>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {[
                  { value: 'week', label: 'Sett' },
                  { value: 'month', label: 'Mese' },
                  { value: 'year', label: 'Anno' },
                  { value: 'all', label: 'Tutto' }
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setTrendPeriod(p.value)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      trendPeriod === p.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="url(#colorTotalGradient)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTotalGradient)"
                  name="Spesa"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ShoppingBag className="text-purple-600 dark:text-purple-400" size={24} />
              Distribuzione per Piattaforma
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomPieLabel}
                  outerRadius={105}
                  innerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  paddingAngle={3}
                >
                  {platformData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke="#fff"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontWeight: 600, fontSize: '13px' }}
                  formatter={(value, entry) => `${value} (€${entry.payload.value})`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Numero Acquisti per Piattaforma */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ShoppingBag className="text-orange-600 dark:text-orange-400" size={24} />
              Acquisti per Piattaforma
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData} barSize={60}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipCount />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Numero Acquisti"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuzione Fasce di Prezzo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Euro className="text-emerald-600 dark:text-emerald-400" size={24} />
              Distribuzione Fasce di Prezzo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceRangeData} barSize={25}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="range"
                  stroke="#9ca3af"
                  style={{ fontSize: '9px', fontWeight: 600 }}
                  tickLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={55}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipCount />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Numero Acquisti"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Frequenza Acquisti */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="text-cyan-600 dark:text-cyan-400" size={24} />
              Frequenza Acquisti
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyData} barSize={40}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="period"
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipCount />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
                <Bar
                  dataKey="count"
                  fill="#06b6d4"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Numero Acquisti"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Acquisti per Giorno Settimana */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="text-pink-600 dark:text-pink-400" size={24} />
              Acquisti per Giorno della Settimana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData} barSize={45}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                  style={{ fontSize: '10px', fontWeight: 600 }}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipCount />} cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
                <Bar
                  dataKey="count"
                  fill="#ec4899"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  name="Numero Acquisti"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {purchases.length === 0 && (
        <div className="bg-white rounded-xl shadow-xl p-12 text-center border border-gray-100">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nessun acquisto trovato
          </h3>
          <p className="text-gray-500">
            Aggiungi il tuo primo acquisto per vedere le statistiche!
          </p>
        </div>
      )}
    </div>
  );
}
