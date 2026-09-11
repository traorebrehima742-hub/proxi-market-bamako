import React from 'react';
import { X, MapPin, Check } from 'lucide-react';

interface QuartierModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuartier: string;
  onSelect: (quartier: string) => void;
}

const QUARTIERS = [
  { name: 'Hamdallaye ACI 2000', commune: 'Commune IV', info: 'Boutiques de mode & Ambassades' },
  { name: 'Lafiabougou', commune: 'Commune IV', info: 'Artisans & Ateliers mécaniques' },
  { name: 'Badalabougou', commune: 'Commune V', info: 'Artisanat d’art & Bogolan' },
  { name: 'Torokorobougou', commune: 'Commune V', info: 'Couture haut de gamme & Marché' },
  { name: 'Quartier du Fleuve', commune: 'Commune III', info: 'Centres d’affaires & Énergie' },
  { name: 'Médine (Sougouni Koura)', commune: 'Commune II', info: 'Fruits & Légumes frais' },
  { name: 'Faladié', commune: 'Commune VI', info: 'BTP, Électricité & Quincaillerie' },
];

export const QuartierModal: React.FC<QuartierModalProps> = ({
  isOpen,
  onClose,
  activeQuartier,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Localisation à Bamako</h3>
            <p className="text-xs text-slate-500">Choisissez votre quartier pour recalculer les distances</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto no-scrollbar py-2">
          {QUARTIERS.map((q) => {
            const isSelected = activeQuartier.includes(q.name) || q.name.includes(activeQuartier);
            return (
              <button
                key={q.name}
                onClick={() => {
                  onSelect(q.name);
                  onClose();
                }}
                className={`w-full text-left py-3 px-2 flex items-center justify-between rounded-xl transition-colors ${
                  isSelected ? 'bg-teal-50/70 text-[#00685f]' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#00685f] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{q.name}</div>
                    <div className="text-[11px] text-slate-400">{q.commune} • {q.info}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#00685f] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
