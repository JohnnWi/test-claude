import { Suspense, lazy, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import QuickAddButton from './components/QuickAddButton';
import { ToastContainer } from './components/Toast';
import { LayoutDashboard, List, Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { sanitizeImportedPurchases } from './utils/importValidation';

const Dashboard = lazy(() => import('./components/Dashboard'));
const PurchasesList = lazy(() => import('./components/PurchasesList'));
const Settings = lazy(() => import('./components/Settings'));
const AddPurchaseModal = lazy(() => import('./components/AddPurchaseModal'));

function App() {
  const [purchases, setPurchases] = useLocalStorage('purchases', []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const toast = useToast();

  const handleAddPurchase = (purchase) => {
    setPurchases([...purchases, purchase]);
  };

  const handleEditPurchase = (updatedPurchase) => {
    setPurchases(purchases.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
  };

  const handleOpenEdit = (purchase) => {
    setEditingPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
  };

  const handleDeletePurchase = (id) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  const exportData = () => {
    try {
      if (purchases.length === 0) {
        toast.info('Non ci sono dati da esportare al momento.');
        return;
      }

      const dataStr = JSON.stringify(purchases, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `acquisti_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Esportazione completata!');
    } catch (error) {
      toast.error('Errore durante l\'esportazione: ' + error.message);
    }
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const { sanitized, invalidCount } = sanitizeImportedPurchases(parsed);

          if (sanitized.length === 0) {
            throw new Error('Nessun acquisto valido trovato nel file.');
          }

          setPurchases(sanitized);
          toast.success(`${sanitized.length} acquisti importati con successo!`);

          if (invalidCount > 0) {
            toast.warning(`${invalidCount} elemento/i sono stati ignorati perché incompleti.`);
          }
        } catch (error) {
          toast.error('Errore durante l\'importazione: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Sei sicuro di voler cancellare TUTTI i dati? Questa azione non può essere annullata!')) {
      setPurchases([]);
      toast.warning('Tutti i dati sono stati cancellati');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                💰 Tracker Spese Online
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Monitora i tuoi acquisti da Amazon e AliExpress
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportData}
                disabled={purchases.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Download size={16} />
                Esporta
              </button>
              <label className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md">
                <Upload size={16} />
                Importa
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              {purchases.length > 0 && (
                <button
                  onClick={clearAllData}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 text-sm shadow-md"
                >
                  <Trash2 size={16} />
                  Cancella Tutto
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Add Purchase Modal */}
      <Suspense fallback={null}>
        {(isModalOpen || editingPurchase) && (
          <AddPurchaseModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onAddPurchase={handleAddPurchase}
            onEditPurchase={handleEditPurchase}
            editingPurchase={editingPurchase}
            showToast={toast.addToast}
          />
        )}
      </Suspense>

      {/* Floating Add Button */}
      <QuickAddButton onClick={() => setIsModalOpen(true)} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6 transition-colors">
          <div className="flex border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <List size={20} />
              Lista Acquisti
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <SettingsIcon size={20} />
              Impostazioni
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <Suspense fallback={<div className="py-20 text-center text-gray-500 dark:text-gray-300">Caricamento sezione...</div>}>
          {activeTab === 'dashboard' && (
            <Dashboard purchases={purchases} onOpenAddModal={() => setIsModalOpen(true)} />
          )}
          {activeTab === 'list' && (
            <PurchasesList
              purchases={purchases}
              onDeletePurchase={handleDeletePurchase}
              onEditPurchase={handleOpenEdit}
              showToast={toast.addToast}
            />
          )}
          {activeTab === 'settings' && (
            <Settings
              purchases={purchases}
              setPurchases={setPurchases}
              showToast={toast.addToast}
              exportData={exportData}
              importData={importData}
            />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900/70 mt-12 py-6 shadow-md backdrop-blur">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>Tracker Spese Online - Tutti i dati sono salvati localmente nel tuo browser</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
