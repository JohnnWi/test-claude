import { useState } from 'react';
import { Search, ExternalLink, Trash2, ArrowUpDown, Package, Calendar, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

// Funzione per generare immagine placeholder in base alla piattaforma
const getProductImage = (platform, productName) => {
  const seed = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = {
    Amazon: ['FF9900', 'FFB84D'],
    AliExpress: ['E62E04', 'FF4D33'],
    Altro: ['6366f1', '8b5cf6']
  };
  const color = colors[platform] || colors['Altro'];
  const bgColor = color[0];
  const textColor = 'FFFFFF';

  // Usa UI Avatars per generare un'immagine con la prima lettera
  const firstLetter = productName.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&size=200&background=${bgColor}&color=${textColor}&bold=true&font-size=0.5`;
};

export default function PurchasesList({ purchases, onDeletePurchase, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredPurchases = purchases
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.platform.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const platformColors = {
    Amazon: 'bg-orange-100 text-orange-800 border-orange-200',
    AliExpress: 'bg-red-100 text-red-800 border-red-200',
    Altro: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const platformGradients = {
    Amazon: 'from-orange-50 to-orange-100',
    AliExpress: 'from-red-50 to-red-100',
    Altro: 'from-purple-50 to-purple-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" />
            Lista Acquisti
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPurchases.length} {filteredPurchases.length === 1 ? 'acquisto trovato' : 'acquisti trovati'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca per nome o piattaforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => toggleSort('date')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            sortBy === 'date'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar size={16} />
          Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => toggleSort('price')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            sortBy === 'price'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <DollarSign size={16} />
          Prezzo {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => toggleSort('name')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            sortBy === 'name'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Package size={16} />
          Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Purchases Grid */}
      {filteredPurchases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className={`bg-gradient-to-br ${platformGradients[purchase.platform] || platformGradients.Altro} border-2 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
            >
              {/* Immagine Prodotto */}
              <div className="relative h-40 bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={getProductImage(purchase.platform, purchase.name)}
                  alt={purchase.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${platformColors[purchase.platform]}`}>
                    {purchase.platform}
                  </span>
                </div>
              </div>

              {/* Contenuto Card */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 min-h-[56px]">
                  {purchase.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                    <DollarSign size={20} className="text-green-600" />
                    €{purchase.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar size={14} />
                    {format(parseISO(purchase.date), 'd MMM', { locale: it })}
                  </div>
                </div>

                {purchase.notes && (
                  <p className="text-xs text-gray-600 italic mb-3 line-clamp-2 bg-white/50 p-2 rounded border-l-2 border-gray-400">
                    "{purchase.notes}"
                  </p>
                )}

                <div className="flex gap-2">
                  {purchase.link && (
                    <a
                      href={purchase.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                    >
                      <ExternalLink size={14} />
                      Vedi
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Sei sicuro di voler eliminare questo acquisto?')) {
                        onDeletePurchase(purchase.id);
                        showToast('Acquisto eliminato', 'info');
                      }
                    }}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                    title="Elimina acquisto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            {searchTerm ? 'Nessun acquisto trovato per la ricerca' : 'Nessun acquisto da mostrare'}
          </p>
        </div>
      )}
    </div>
  );
}
