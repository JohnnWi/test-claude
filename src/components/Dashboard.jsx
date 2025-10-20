import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, ShoppingBag, Euro, Calendar } from 'lucide-react';
import { calculateTotal, calculateByPlatform, getMonthlyData } from '../utils/calculations';

const COLORS = {
  Amazon: '#FF9900',
  AliExpress: '#E62E04',
  Altro: '#6366f1'
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// Custom Tooltip elegante
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
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

// Custom Label per Pie Chart
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
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

export default function Dashboard({ purchases, period }) {
  const total = calculateTotal(purchases);
  const byPlatform = calculateByPlatform(purchases);
  const monthlyData = getMonthlyData(purchases);

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Spesa Totale</p>
              <p className="text-3xl font-bold mt-1">€{total.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">{periodLabels[period]}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Euro size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Acquisti</p>
              <p className="text-3xl font-bold mt-1">{purchases.length}</p>
              <p className="text-green-100 text-xs mt-1">{periodLabels[period]}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <ShoppingBag size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Media Acquisto</p>
              <p className="text-3xl font-bold mt-1">
                €{purchases.length > 0 ? (total / purchases.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-purple-100 text-xs mt-1">Per ordine</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Piattaforme</p>
              <p className="text-3xl font-bold mt-1">{Object.keys(byPlatform).length}</p>
              <p className="text-orange-100 text-xs mt-1">Utilizzate</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar size={32} className="opacity-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {purchases.length > 0 && (
        <>
          {/* Trend temporale con Line + Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Trend Spese Mensili
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Spesa"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="text-purple-600" size={24} />
                Confronto Mensile
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    fill="url(#barGradient)"
                    name="Spesa"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart + Radial Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Distribuzione Spese</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {platformData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => `${value} (€${entry.payload.value})`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Numero Acquisti per Piattaforma</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="90%"
                  barSize={40}
                  data={platformData.map((p, i) => ({
                    ...p,
                    value: p.count,
                    fill: CHART_COLORS[i % CHART_COLORS.length]
                  }))}
                >
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 14, fontWeight: 'bold' }}
                    background
                    clockWise
                    dataKey="value"
                    animationDuration={1000}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry) => `${value} (${entry.payload.value})`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Additional Stats */}
      {purchases.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Statistiche Aggiuntive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-green-300 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              <p className="text-sm text-green-700 font-medium mb-1 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Acquisto più Economico
              </p>
              <p className="text-3xl font-bold text-green-800 my-2">
                €{Math.min(...purchases.map(p => p.price)).toFixed(2)}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {purchases.find(p => p.price === Math.min(...purchases.map(p => p.price)))?.name}
              </p>
            </div>
            <div className="bg-white border-2 border-red-300 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              <p className="text-sm text-red-700 font-medium mb-1 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Acquisto più Costoso
              </p>
              <p className="text-3xl font-bold text-red-800 my-2">
                €{Math.max(...purchases.map(p => p.price)).toFixed(2)}
              </p>
              <p className="text-sm text-red-600 font-medium">
                {purchases.find(p => p.price === Math.max(...purchases.map(p => p.price)))?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {purchases.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dettaglio per Piattaforma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(byPlatform).map(([platform, data]) => (
              <div
                key={platform}
                className="border-2 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-2xl"
                style={{ borderColor: COLORS[platform] || '#6366f1' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">{platform}</h4>
                  <div
                    className="w-6 h-6 rounded-full shadow-md"
                    style={{ backgroundColor: COLORS[platform] || '#6366f1' }}
                  />
                </div>
                <p className="text-3xl font-bold mb-2" style={{ color: COLORS[platform] || '#6366f1' }}>
                  €{data.total.toFixed(2)}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="font-medium">{data.count} acquisti</span>
                  <span className="font-medium">Avg: €{(data.total / data.count).toFixed(2)}</span>
                </div>
              </div>
            ))}
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
