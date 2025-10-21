import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings as SettingsIcon, User, Trash2, Download, Upload, Save, AlertTriangle, Moon, Sun, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

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
    const newSettings = { ...formData, darkMode: newDarkMode };
    setFormData(newSettings);
    setUserSettings(newSettings);

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

  const generatePDFReport = () => {
    if (purchases.length === 0) {
      showToast('Nessun acquisto da includere nel report!', 'warning');
      return;
    }

    // Calcola statistiche
    const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalSpent / purchases.length;
    const byPlatform = purchases.reduce((acc, p) => {
      if (!acc[p.platform]) {
        acc[p.platform] = { count: 0, total: 0 };
      }
      acc[p.platform].count++;
      acc[p.platform].total += p.price;
      return acc;
    }, {});

    // Ordina acquisti per data (più recenti prima)
    const sortedPurchases = [...purchases].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    // Crea HTML per la stampa
    const printWindow = window.open('', '_blank');
    const reportDate = format(new Date(), 'dd MMMM yyyy', { locale: it });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Report Acquisti - ${reportDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #4F46E5;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }
          .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .stat-card h3 {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
          }
          .stat-card p {
            font-size: 28px;
            font-weight: bold;
          }
          .platform-stats {
            margin-bottom: 40px;
          }
          .platform-stats h2 {
            color: #4F46E5;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .platform-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .platform-card {
            border: 2px solid #E5E7EB;
            padding: 15px;
            border-radius: 8px;
          }
          .platform-card h4 {
            color: #1F2937;
            margin-bottom: 10px;
          }
          .purchases-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .purchases-table th {
            background: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .purchases-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #E5E7EB;
          }
          .purchases-table tr:nth-child(even) {
            background: #F9FAFB;
          }
          .platform-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .amazon { background: #FF9900; color: white; }
          .aliexpress { background: #E62E04; color: white; }
          .altro { background: #6366f1; color: white; }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
          }
          @media print {
            body { padding: 20px; }
            .stat-card { break-inside: avoid; }
            .platform-card { break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 Report Acquisti Online</h1>
          <p>Generato il ${reportDate}</p>
          ${formData.firstName ? `<p>Intestato a: ${formData.firstName} ${formData.lastName}</p>` : ''}
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>Acquisti Totali</h3>
            <p>${purchases.length}</p>
          </div>
          <div class="stat-card">
            <h3>Spesa Totale</h3>
            <p>€${totalSpent.toFixed(2)}</p>
          </div>
          <div class="stat-card">
            <h3>Spesa Media</h3>
            <p>€${avgPrice.toFixed(2)}</p>
          </div>
        </div>

        <div class="platform-stats">
          <h2>📊 Statistiche per Piattaforma</h2>
          <div class="platform-grid">
            ${Object.entries(byPlatform).map(([platform, data]) => `
              <div class="platform-card">
                <h4>${platform}</h4>
                <p><strong>Acquisti:</strong> ${data.count}</p>
                <p><strong>Totale:</strong> €${data.total.toFixed(2)}</p>
                <p><strong>Media:</strong> €${(data.total / data.count).toFixed(2)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <h2 style="color: #4F46E5; margin-bottom: 20px; font-size: 24px;">🛍️ Elenco Acquisti</h2>
        <table class="purchases-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Prodotto</th>
              <th>Piattaforma</th>
              <th>Prezzo</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${sortedPurchases.map(p => `
              <tr>
                <td>${format(parseISO(p.date), 'dd/MM/yyyy', { locale: it })}</td>
                <td><strong>${p.name}</strong></td>
                <td>
                  <span class="platform-badge ${p.platform.toLowerCase().replace(/\s+/g, '')}">${p.platform}</span>
                </td>
                <td><strong>€${p.price.toFixed(2)}</strong></td>
                <td>${p.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Report generato da Tracker Spese Online</p>
          <p>Tutti i dati sono gestiti localmente nel tuo browser</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    showToast('Report PDF generato! Usa "Salva come PDF" nella finestra di stampa.', 'success');
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Statistiche Account</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Acquisti Totali</p>
            <p className="text-3xl font-bold text-green-800 dark:text-green-100">{stats.totalPurchases}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Spesa Totale</p>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-100">€{stats.totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4 transition-colors">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Dati Salvati</p>
            <p className="text-3xl font-bold text-purple-800 dark:text-purple-100">{stats.dataSize.toFixed(2)} KB</p>
          </div>
        </div>
      </div>

      {/* Gestione Dati */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Gestione Dati</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={generatePDFReport}
            disabled={purchases.length === 0}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <FileText size={20} />
            Report PDF
          </button>

          <button
            onClick={exportData}
            disabled={purchases.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Download size={20} />
            Esporta JSON
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

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={24} />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-1">
                Informazioni sulla Privacy
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Tutti i tuoi dati sono salvati localmente nel browser (localStorage).
                Nessun dato viene inviato a server esterni.
                Ti consigliamo di esportare regolarmente i tuoi dati come backup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zona Pericolosa */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-red-200 dark:border-red-800 transition-colors">
        <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
          Zona Pericolosa
        </h3>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Conferma Cancellazione</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Sei sicuro di voler cancellare <span className="font-bold text-red-600 dark:text-red-400">TUTTI</span> i dati?
              <br />
              <br />
              Verranno eliminati:
            </p>

            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-1">
              <li><span className="font-semibold">{purchases.length}</span> acquisti</li>
              <li>Tutte le impostazioni personali</li>
              <li>Tutti i backup locali</li>
            </ul>

            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 transition-colors">
              <p className="text-sm text-red-800 dark:text-red-300 font-bold">
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
