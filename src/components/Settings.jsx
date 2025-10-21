import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings as SettingsIcon, User, Trash2, Download, Upload, Save, AlertTriangle, Moon, Sun } from 'lucide-react';

export default function Settings({ purchases, setPurchases, showToast, exportData, importData }) {
  const [userSettings, setUserSettings] = useLocalStorage('userSettings', {
    firstName: '',
    lastName: '',
    currency: 'EUR',
    language: 'it',
    darkMode: false
  });

  const [formData, setFormData] = useState(userSettings);
  const [showResetModal, setShowResetModal] = useState(false);

  // Applica dark mode quando cambia l'impostazione
  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  const handleSave = () => {
    setUserSettings(formData);
    showToast('Impostazioni salvate con successo!', 'success');
  };

  const handleReset = () => {
    setPurchases([]);
    const defaultSettings = {
      firstName: '',
      lastName: '',
      currency: 'EUR',
      language: 'it',
      darkMode: false
    };
    setUserSettings(defaultSettings);
    setFormData(defaultSettings);
    setShowResetModal(false);
    showToast('Tutti i dati sono stati cancellati!', 'warning');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !formData.darkMode;
    setFormData(prev => ({ ...prev, darkMode: newDarkMode }));
    setUserSettings({ ...formData, darkMode: newDarkMode });

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const stats = {
    totalPurchases: purchases.length,
    totalSpent: purchases.reduce((sum, p) => sum + p.price, 0),
    dataSize: new Blob([JSON.stringify(purchases)]).size / 1024 // KB
  };

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon size={32} />
          <h2 className="text-3xl font-bold">Impostazioni</h2>
        </div>
        <p className="text-blue-100">Personalizza la tua esperienza e gestisci i tuoi dati</p>
      </div>

      {/* Profilo Utente */}
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="text-blue-600" size={24} />
          Profilo Utente
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cognome
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rossi"
            />
          </div>
        </div>

        {formData.firstName && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium">
              Ciao, <span className="font-bold">{formData.firstName} {formData.lastName}</span>! 👋
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
        >
          <Save size={20} />
          Salva Impostazioni
        </button>
      </div>

      {/* Tema Scuro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          {formData.darkMode ? <Moon className="text-purple-600" size={24} /> : <Sun className="text-yellow-600" size={24} />}
          Tema Scuro
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Attiva il tema scuro per ridurre l'affaticamento degli occhi in ambienti poco illuminati.
        </p>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
          <div className="flex items-center gap-3">
            {formData.darkMode ? (
              <Moon className="text-purple-600 dark:text-purple-400" size={28} />
            ) : (
              <Sun className="text-yellow-600" size={28} />
            )}
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {formData.darkMode ? 'Tema Scuro Attivo' : 'Tema Chiaro Attivo'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {formData.darkMode ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors ${
              formData.darkMode ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-6 h-6 transform rounded-full bg-white shadow-lg transition-transform ${
                formData.darkMode ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Statistiche Account */}
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Statistiche Account</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-1">Acquisti Totali</p>
            <p className="text-3xl font-bold text-green-800">{stats.totalPurchases}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Spesa Totale</p>
            <p className="text-3xl font-bold text-blue-800">€{stats.totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium mb-1">Dati Salvati</p>
            <p className="text-3xl font-bold text-purple-800">{stats.dataSize.toFixed(2)} KB</p>
          </div>
        </div>
      </div>

      {/* Gestione Dati */}
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Gestione Dati</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={exportData}
            disabled={purchases.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Download size={20} />
            Esporta Dati
          </button>

          <label className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 font-medium cursor-pointer shadow-md">
            <Upload size={20} />
            Importa Dati
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Informazioni sulla Privacy
              </p>
              <p className="text-xs text-yellow-700">
                Tutti i tuoi dati sono salvati localmente nel browser (localStorage).
                Nessun dato viene inviato a server esterni.
                Ti consigliamo di esportare regolarmente i tuoi dati come backup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zona Pericolosa */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-red-200">
        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={24} />
          Zona Pericolosa
        </h3>

        <p className="text-sm text-gray-700 mb-4">
          Questa azione cancellerà TUTTI i tuoi dati inclusi acquisti e impostazioni.
          Questa operazione è irreversibile!
        </p>

        <button
          onClick={() => setShowResetModal(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
        >
          <Trash2 size={20} />
          Cancella Tutti i Dati
        </button>
      </div>

      {/* Modal Conferma Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Conferma Cancellazione</h3>
            </div>

            <p className="text-gray-700 mb-6">
              Sei sicuro di voler cancellare <span className="font-bold text-red-600">TUTTI</span> i dati?
              <br />
              <br />
              Verranno eliminati:
            </p>

            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li><span className="font-semibold">{purchases.length}</span> acquisti</li>
              <li>Tutte le impostazioni personali</li>
              <li>Tutti i backup locali</li>
            </ul>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800 font-bold">
                ⚠️ Questa azione NON può essere annullata!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-3 px-6 rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all font-medium shadow-md"
              >
                Annulla
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md"
              >
                Sì, Cancella Tutto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
