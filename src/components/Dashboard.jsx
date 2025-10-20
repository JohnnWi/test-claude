import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Euro, Calendar } from 'lucide-react';
import { calculateTotal, calculateByPlatform, getMonthlyData } from '../utils/calculations';

const COLORS = {
  Amazon: '#FF9900',
  AliExpress: '#E62E04',
  Altro: '#6366f1'
};

export default function Dashboard({ purchases, period }) {
  const total = calculateTotal(purchases);
  const byPlatform = calculateByPlatform(purchases);
  const monthlyData = getMonthlyData(purchases);

  const platformData = Object.entries(byPlatform).map(([platform, data]) => ({
    name: platform,
    value: parseFloat(data.total.toFixed(2)),
    count: data.count
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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Spesa Totale</p>
              <p className="text-3xl font-bold mt-1">€{total.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">{periodLabels[period]}</p>
            </div>
            <Euro size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Acquisti</p>
              <p className="text-3xl font-bold mt-1">{purchases.length}</p>
              <p className="text-green-100 text-xs mt-1">{periodLabels[period]}</p>
            </div>
            <ShoppingBag size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Media Acquisto</p>
              <p className="text-3xl font-bold mt-1">
                €{purchases.length > 0 ? (total / purchases.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-purple-100 text-xs mt-1">Per ordine</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Piattaforme</p>
              <p className="text-3xl font-bold mt-1">{Object.keys(byPlatform).length}</p>
              <p className="text-orange-100 text-xs mt-1">Utilizzate</p>
            </div>
            <Calendar size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Andamento Mensile</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Spesa (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Distribuzione per Piattaforma</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: €${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {purchases.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dettaglio per Piattaforma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(byPlatform).map(([platform, data]) => (
              <div key={platform} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{platform}</h4>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[platform] || '#6366f1' }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">€{data.total.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">{data.count} acquisti</p>
                <p className="text-sm text-gray-600">
                  Media: €{(data.total / data.count).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {purchases.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
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
