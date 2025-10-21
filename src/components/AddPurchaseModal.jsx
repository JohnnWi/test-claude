import { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Link as LinkIcon, Image as ImageIcon, Calendar, DollarSign, FileText, RotateCcw, Save } from 'lucide-react';

export default function AddPurchaseModal({ isOpen, onClose, onAddPurchase, onEditPurchase, editingPurchase, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    link: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    platform: 'Amazon',
    notes: ''
  });
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Popola il form quando si sta modificando un acquisto
  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        name: editingPurchase.name,
        price: editingPurchase.price.toString(),
        link: editingPurchase.link || '',
        imageUrl: editingPurchase.imageUrl || '',
        date: editingPurchase.date,
        platform: editingPurchase.platform,
        notes: editingPurchase.notes || ''
      });
    } else {
      // Reset del form quando non si sta modificando
      resetForm();
    }
  }, [editingPurchase]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      link: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      platform: 'Amazon',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Nome e prezzo sono obbligatori!', 'error');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      showToast('Il prezzo deve essere maggiore di zero!', 'error');
      return;
    }

    if (editingPurchase) {
      // Modalità modifica
      onEditPurchase({
        ...editingPurchase,
        ...formData,
        price: parseFloat(formData.price)
      });
      showToast('Acquisto modificato con successo!', 'success');
    } else {
      // Modalità aggiungi
      onAddPurchase({
        id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price)
      });
      showToast('Acquisto aggiunto con successo!', 'success');
    }

    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-detect platform from link
    if (name === 'link' && value) {
      if (value.includes('amazon')) {
        setFormData(prev => ({ ...prev, platform: 'Amazon' }));
      } else if (value.includes('aliexpress')) {
        setFormData(prev => ({ ...prev, platform: 'AliExpress' }));
      }
    }
  };

  const fetchImagePreview = async () => {
    if (!formData.link) {
      showToast('Inserisci prima un link del prodotto!', 'warning');
      return;
    }

    setIsLoadingPreview(true);
    try {
      // Prova prima con microlink.io con screenshot come fallback
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(formData.link)}&screenshot=true&meta=false&palette=false&audio=false&video=false`
      );
      const data = await response.json();

      console.log('Microlink API response:', data);

      if (data.status === 'success' && data.data) {
        // Priorità: logo -> image -> screenshot
        let imageUrl = null;
        let title = data.data.title;

        // Prova con Open Graph image
        if (data.data.image?.url) {
          imageUrl = data.data.image.url;
          console.log('Found OG image:', imageUrl);
        }
        // Fallback a logo
        else if (data.data.logo?.url) {
          imageUrl = data.data.logo.url;
          console.log('Found logo:', imageUrl);
        }
        // Fallback a screenshot
        else if (data.data.screenshot?.url) {
          imageUrl = data.data.screenshot.url;
          console.log('Using screenshot:', imageUrl);
        }

        if (imageUrl) {
          setFormData(prev => ({
            ...prev,
            imageUrl: imageUrl,
            name: prev.name || title || prev.name
          }));
          showToast('✓ Immagine caricata con successo!', 'success');
        } else {
          showToast('⚠️ Nessuna immagine trovata. Usa il metodo manuale qui sotto.', 'warning');
        }
      } else {
        console.error('API Error:', data);
        showToast('⚠️ Impossibile caricare l\'immagine. Usa il metodo manuale.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      showToast('❌ Errore di caricamento. Usa il metodo manuale copiando l\'URL dell\'immagine.', 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <ShoppingCart size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingPurchase ? 'Modifica Acquisto' : 'Aggiungi Acquisto'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {editingPurchase ? 'Aggiorna le informazioni del prodotto' : 'Traccia un nuovo prodotto acquistato'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome Prodotto */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ShoppingCart size={16} className="text-blue-600" />
              Nome Prodotto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Es: Cuffie Bluetooth Sony WH-1000XM4"
              required
            />
          </div>

          {/* Prezzo e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign size={16} className="text-green-600" />
                Prezzo (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="29.99"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="text-purple-600" />
                Data Acquisto
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Link Prodotto */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="text-blue-600" />
              Link Prodotto
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://www.amazon.it/..."
              />
              <button
                type="button"
                onClick={fetchImagePreview}
                disabled={isLoadingPreview || !formData.link}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium shadow-md"
              >
                {isLoadingPreview ? '⏳ Carico...' : '🔍 Prova Auto'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Clicca "Prova Auto" per tentare il caricamento automatico (potrebbe non funzionare con Amazon/AliExpress)
            </p>
          </div>

          {/* URL Immagine */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ImageIcon size={16} className="text-pink-600" />
              URL Immagine Prodotto
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Incolla qui l'URL dell'immagine..."
            />
            <div className="mt-2 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-xs text-blue-800">
                <strong>💡 Come ottenere l'immagine manualmente:</strong><br/>
                <strong>Amazon:</strong> Apri l'immagine in una nuova scheda → Copia l'URL dalla barra indirizzi<br/>
                <strong>AliExpress:</strong> Click destro sull'immagine → "Apri immagine in una nuova scheda" → Copia URL<br/>
                <strong>Altro:</strong> Click destro sull'immagine → "Copia indirizzo immagine"
              </p>
            </div>
            {formData.imageUrl && (
              <div className="mt-3 border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Anteprima:</p>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showToast('Immagine non valida o non accessibile. Prova a incollare l\'URL direttamente dall\'immagine del prodotto.', 'error');
                  }}
                />
              </div>
            )}
          </div>

          {/* Piattaforma */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Piattaforma
            </label>
            <div className="flex gap-3 flex-wrap">
              {['Amazon', 'AliExpress', 'Altro'].map((platform) => (
                <label
                  key={platform}
                  className={`flex-1 min-w-[120px] cursor-pointer transition-all ${
                    formData.platform === platform
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } rounded-xl p-3 text-center font-medium`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={formData.platform === platform}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="text-gray-600" />
              Note
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Aggiungi note sull'acquisto... (es: Regalo di compleanno, Sconto 50%)"
            />
          </div>

          {/* Bottoni */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw size={20} />
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              {editingPurchase ? (
                <>
                  <Save size={20} />
                  Salva Modifiche
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Aggiungi Acquisto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
