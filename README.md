# 💰 Tracker Spese Online

Un'applicazione web moderna e intuitiva per monitorare i tuoi acquisti da Amazon, AliExpress e altre piattaforme online.

## ✨ Caratteristiche

- **📊 Dashboard Interattiva**: Visualizza statistiche complete delle tue spese con grafici a barre e torta
- **➕ Aggiungi Acquisti**: Form intuitivo per registrare i tuoi acquisti con nome, prezzo, link, note e data
- **🔍 Ricerca e Filtri**: Cerca tra i tuoi acquisti e filtra per periodo (settimana, mese, anno)
- **📈 Statistiche Dettagliate**:
  - Spesa totale per periodo
  - Numero di acquisti
  - Media spesa per acquisto
  - Acquisto più costoso e più economico
  - Distribuzione per piattaforma
  - Andamento mensile con grafici
- **💾 Esporta/Importa**: Salva e ripristina i tuoi dati in formato JSON
- **🗑️ Gestione Dati**: Cancella tutti i dati con un click
- **🔔 Notifiche Toast**: Feedback visivo per ogni azione
- **✨ Animazioni Fluide**: Transizioni e animazioni per un'esperienza utente migliore
- **📝 Note**: Aggiungi note personalizzate a ogni acquisto
- **🎨 Interfaccia Moderna**: Design pulito e responsive con TailwindCSS

## 🚀 Come Iniziare

### Prerequisiti

- Node.js (versione 16 o superiore)
- npm o yarn

### Installazione

1. Clona il repository:
```bash
git clone <url-del-repository>
cd test-claude
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

4. Apri il browser all'indirizzo mostrato nel terminale (solitamente `http://localhost:5173`)

## 📱 Come Usare l'App

### Aggiungere un Acquisto

1. Compila il form "Aggiungi Acquisto" con:
   - **Nome Prodotto** (obbligatorio): Es. "Cuffie Bluetooth"
   - **Prezzo** (obbligatorio): Il prezzo in euro
   - **Link Prodotto** (opzionale): URL del prodotto su Amazon/AliExpress
   - **Data Acquisto**: Seleziona la data
   - **Note** (opzionale): Aggiungi note personalizzate sull'acquisto
   - **Piattaforma**: Scegli tra Amazon, AliExpress o Altro

2. Clicca su "Aggiungi Acquisto"
3. Riceverai una notifica di conferma!

### Visualizzare le Statistiche

1. Usa i filtri periodo per vedere le spese di:
   - Tutto il tempo
   - Quest'anno
   - Questo mese
   - Questa settimana

2. Nella tab **Dashboard** vedrai:
   - Card con totali e statistiche (spesa totale, numero acquisti, media, piattaforme)
   - Grafico a barre dell'andamento mensile
   - Grafico a torta della distribuzione per piattaforma
   - Statistiche aggiuntive: acquisto più costoso e più economico
   - Dettaglio spese per ogni piattaforma con conteggi e medie

3. Nella tab **Lista Acquisti** puoi:
   - Cercare acquisti per nome o piattaforma
   - Ordinare per data, prezzo o nome
   - Visualizzare tutti i dettagli
   - Eliminare acquisti
   - Aprire i link dei prodotti

### Esportare/Importare Dati

- **Esporta**: Clicca sul pulsante "Esporta" nell'header per scaricare un file JSON con tutti i tuoi dati
- **Importa**: Clicca su "Importa" e seleziona un file JSON precedentemente esportato
- **Cancella Tutto**: Clicca sul pulsante "Cancella Tutto" (rosso) per eliminare tutti i dati

⚠️ **Attenzione**: L'eliminazione di tutti i dati è irreversibile! Assicurati di esportare prima se vuoi mantenere un backup.

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI
- **Vite** - Build tool velocissimo
- **TailwindCSS** - Styling moderno
- **Recharts** - Grafici interattivi
- **Lucide React** - Icone moderne
- **date-fns** - Manipolazione date
- **localStorage** - Persistenza dati locale

## 💾 Storage dei Dati

Tutti i tuoi dati sono salvati **localmente nel browser** utilizzando localStorage. Questo significa:

- ✅ I dati non vengono mai inviati a server esterni
- ✅ Privacy completa
- ✅ Funziona offline
- ⚠️ I dati sono legati al browser specifico (usa Esporta per fare backup)

## 🎨 Personalizzazione

L'app è completamente personalizzabile! Puoi:

- Modificare i colori in `tailwind.config.js`
- Aggiungere nuove piattaforme modificando i componenti
- Estendere le statistiche in `src/utils/calculations.js`

## 📦 Build per Produzione

Per creare una build ottimizzata:

```bash
npm run build
```

I file statici saranno generati nella cartella `dist/` e possono essere deployati su qualsiasi hosting statico (Netlify, Vercel, GitHub Pages, ecc.).

## 🤝 Contribuire

Sentiti libero di aprire issue o pull request per miglioramenti!

## 📄 Licenza

MIT

---

**Buon tracking delle spese! 🎉**
