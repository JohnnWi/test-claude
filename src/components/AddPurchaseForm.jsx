import { useState } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';

export default function AddPurchaseForm({ onAddPurchase }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    link: '',
    date: new Date().toISOString().split('T')[0],
    platform: 'Amazon'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Nome e prezzo sono obbligatori!');
      return;
    }

    onAddPurchase({
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price)
    });

    setFormData({
      name: '',
      price: '',
      link: '',
      date: new Date().toISOString().split('T')[0],
      platform: 'Amazon'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Aggiungi Acquisto</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Prodotto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Cuffie Bluetooth"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prezzo (€) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="29.99"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Prodotto (opzionale)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Acquisto
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piattaforma
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="Amazon"
                  checked={formData.platform === 'Amazon'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Amazon</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="AliExpress"
                  checked={formData.platform === 'AliExpress'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">AliExpress</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="Altro"
                  checked={formData.platform === 'Altro'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Altro</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Aggiungi Acquisto
        </button>
      </form>
    </div>
  );
}
