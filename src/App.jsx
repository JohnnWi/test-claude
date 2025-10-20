import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterPurchasesByPeriod } from './utils/calculations';
import AddPurchaseForm from './components/AddPurchaseForm';
import Dashboard from './components/Dashboard';
import PurchasesList from './components/PurchasesList';
import { LayoutDashboard, List, Download, Upload } from 'lucide-react';

function App() {
  const [purchases, setPurchases] = useLocalStorage('purchases', []);
  const [period, setPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  const filteredPurchases = period === 'all' ? purchases : filterPurchasesByPeriod(purchases, period);

  const handleAddPurchase = (purchase) => {
    setPurchases([...purchases, purchase]);
  };

  const handleDeletePurchase = (id) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(purchases, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acquisti_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            setPurchases(imported);
            alert('Dati importati con successo!');
          } else {
            alert('Formato file non valido');
          }
        } catch (error) {
          alert('Errore durante l\'importazione: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                💰 Tracker Spese Online
              </h1>
              <p className="text-gray-600 mt-1">
                Monitora i tuoi acquisti da Amazon e AliExpress
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Esporta
              </button>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={16} />
                Importa
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Add Purchase Form */}
        <AddPurchaseForm onAddPurchase={handleAddPurchase} />

        {/* Period Filter */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-700 font-medium">Periodo:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Tutto' },
                { value: 'year', label: 'Quest\'anno' },
                { value: 'month', label: 'Questo mese' },
                { value: 'week', label: 'Questa settimana' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    period === p.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List size={20} />
              Lista Acquisti
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <Dashboard purchases={filteredPurchases} period={period} />
        )}
        {activeTab === 'list' && (
          <PurchasesList
            purchases={filteredPurchases}
            onDeletePurchase={handleDeletePurchase}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6 shadow-md">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Tracker Spese Online - Tutti i dati sono salvati localmente nel tuo browser</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
