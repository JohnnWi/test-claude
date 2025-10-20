import { Plus } from 'lucide-react';

export default function QuickAddButton({ onClick }) {
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={onClick}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 group"
        title="Aggiungi Acquisto"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Tooltip */}
      <div className="fixed bottom-8 right-24 bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
        Aggiungi Acquisto
      </div>
    </>
  );
}
