import { Plus } from 'lucide-react';

export default function QuickAddButton({ onClick }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40 group">
      {/* Floating Action Button */}
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
        title="Aggiungi Acquisto"
      >
        <Plus size={32} className="transition-transform duration-300 group-hover:rotate-90" />
      </button>

      {/* Tooltip */}
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:opacity-100 transition-all shadow-lg">
        Aggiungi Acquisto
      </div>
    </div>
  );
}
