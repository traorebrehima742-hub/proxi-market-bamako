import React, { useState } from 'react';
import { ArtisanItem } from '../types';
import { X, Calendar, Clock, MapPin, Send, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react';

interface QuoteModalProps {
  artisan: ArtisanItem | null;
  onClose: () => void;
  onSubmitQuote: (artisan: ArtisanItem, details: { project: string; urgency: string; address: string; description: string }) => void;
  onStartChat?: (artisan: ArtisanItem) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  artisan,
  onClose,
  onSubmitQuote,
  onStartChat,
}) => {
  const [project, setProject] = useState('');
  const [urgency, setUrgency] = useState('Aujourd’hui (Urgent)');
  const [address, setAddress] = useState('Hamdallaye ACI 2000, Rue 314');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!artisan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitQuote(artisan, { project, urgency, address, description });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Demande de devis envoyée !</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              <strong>{artisan.name}</strong> a reçu votre demande avec votre adresse. Vous recevrez une estimation sous 15 minutes dans l’onglet Messages.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-100"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-slate-900 text-base">{artisan.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">{artisan.trade}</p>
                <p className="text-[11px] font-semibold text-[#00685f] mt-0.5">{artisan.priceNote}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <span className="font-semibold text-slate-800">Garantie Proxi Artisans :</span> Devis gratuit, tarif transparent sans intermédiaire et paiement après inspection.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Projet ou Nature de la panne
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Ex: Révision carburation moto, fuite tuyauterie..."
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-[#00685f] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgence</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full h-11 px-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#00685f] focus:outline-none"
                >
                  <option value="Aujourd’hui (Urgent)">Aujourd’hui (Urgent)</option>
                  <option value="Demain matin">Demain matin</option>
                  <option value="Ce week-end">Ce week-end</option>
                  <option value="Simple devis comparatif">Devis comparatif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quartier Bamako</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier & Rue"
                  required
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs focus:border-[#00685f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Détails complémentaires (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Précisez la marque, le modèle ou les symptômes..."
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-[#00685f] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre ma demande de devis</span>
            </button>

            {onStartChat && (
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartChat(artisan);
                  }}
                  className="text-xs text-[#00685f] hover:text-[#00574f] font-bold flex items-center justify-center gap-1.5 mx-auto py-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Vous préférez discuter directement dans l'application ?</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
