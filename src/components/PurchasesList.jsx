import { useState } from 'react';
import { Search, ExternalLink, Trash2, ArrowUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export default function PurchasesList({ purchases, onDeletePurchase }) {
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
    Amazon: 'bg-orange-100 text-orange-800',
    AliExpress: 'bg-red-100 text-red-800',
    Altro: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista Acquisti</h2>
        <div className="text-sm text-gray-600">
          {filteredPurchases.length} {filteredPurchases.length === 1 ? 'acquisto' : 'acquisti'}
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => toggleSort('date')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Data <ArrowUpDown size={14} />
        </button>
        <button
          onClick={() => toggleSort('price')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Prezzo <ArrowUpDown size={14} />
        </button>
        <button
          onClick={() => toggleSort('name')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Nome <ArrowUpDown size={14} />
        </button>
      </div>

      {/* Purchases List */}
      {filteredPurchases.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{purchase.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[purchase.platform]}`}>
                      {purchase.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-bold text-lg text-gray-900">€{purchase.price.toFixed(2)}</span>
                    <span>
                      {format(parseISO(purchase.date), 'd MMMM yyyy', { locale: it })}
                    </span>
                  </div>

                  {purchase.link && (
                    <a
                      href={purchase.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Vedi prodotto <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Sei sicuro di voler eliminare questo acquisto?')) {
                      onDeletePurchase(purchase.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Nessun acquisto trovato per la ricerca' : 'Nessun acquisto da mostrare'}
        </div>
      )}
    </div>
  );
}
