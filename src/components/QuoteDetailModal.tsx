import React, { useState } from 'react';
import { QuoteItem, QuoteStatus } from '../types';
import { 
  X, ShieldCheck, Phone, MessageSquare, CheckCircle2, 
  XCircle, Clock, Calendar, MapPin, Printer, Download, 
  Wrench, AlertCircle, FileText, ChevronRight, Share2 
} from 'lucide-react';

interface QuoteDetailModalProps {
  quote: QuoteItem | null;
  onClose: () => void;
  onStatusChange?: (quoteId: string, newStatus: QuoteStatus) => void;
  onOpenChat?: (quote: QuoteItem) => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  onClose,
  onStatusChange,
  onOpenChat,
}) => {
  if (!quote) return null;

  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-[#855300] flex items-center gap-1.5 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Devis chiffré reçu</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Devis accepté</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Devis décliné</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 flex items-center gap-1.5 border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prestation terminée</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5 border border-slate-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>En attente de chiffrage</span>
          </span>
        );
    }
  };

  const handleAccept = () => {
    if (!onStatusChange) return;
    setIsProcessing(true);
    setTimeout(() => {
      onStatusChange(quote.id, 'accepted');
      setIsProcessing(false);
    }, 400);
  };

  const handleReject = () => {
    if (!onStatusChange) return;
    if (confirm('Êtes-vous certain de vouloir décliner ce devis ?')) {
      onStatusChange(quote.id, 'rejected');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(quote.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.location.href = `tel:${quote.artisanPhone}`;
  };

  const totalCalculated = quote.breakdown && quote.breakdown.length > 0
    ? quote.breakdown.reduce((sum, item) => sum + item.amount, 0)
    : quote.priceEstimate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] rounded-3xl bg-white overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#855300] flex items-center justify-center shrink-0 border border-amber-200/80">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 truncate">
                  Devis {quote.reference}
                </h3>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[10px] text-slate-400 hover:text-slate-700 underline shrink-0"
                  title="Copier la référence"
                >
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Émis le {quote.createdAt} • Valable jusqu'au {quote.validUntil}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-100 transition-colors"
              title="Imprimer / Sauvegarder"
              aria-label="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-600">Statut du devis :</span>
            {getStatusBadge(quote.status)}
          </div>

          {/* Artisan Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Artisan prestataire
            </div>
            <div className="flex items-center gap-3">
              <img
                src={quote.artisanAvatar}
                alt={quote.artisanName}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {quote.artisanName}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-[#00685f] shrink-0" />
                </div>
                <p className="text-xs text-slate-600 font-medium truncate">
                  {quote.artisanTrade}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
                  <span className="truncate">{quote.artisanLocation}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCall}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00685f] border border-teal-200 transition-colors"
                  title="Appeler l'artisan"
                >
                  <Phone className="w-4 h-4" />
                </button>
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat(quote);
                    }}
                    className="p-2.5 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white transition-colors"
                    title="Ouvrir la discussion"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Project & Nature of Work */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Nature des travaux demandés
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[#855300] text-[10px] font-bold border border-amber-200/60">
                {quote.urgency}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {quote.project}
            </h4>
            {quote.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                « {quote.description} »
              </p>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Adresse d'intervention :</span>
              <span className="font-bold text-slate-700 text-right truncate max-w-[220px]">
                {quote.clientAddress}
              </span>
            </div>
          </div>

          {/* Detailed Price Breakdown Table */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
              <span>Détail estimatif des prestations</span>
              <span>Montant (FCFA)</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {quote.breakdown && quote.breakdown.length > 0 ? (
                quote.breakdown.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium leading-tight">
                      {item.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {item.amount.toLocaleString()} FCFA
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <span className="text-slate-700 font-medium">Diagnostic & Intervention forfaitaire</span>
                  <span className="font-mono font-bold text-slate-900">{quote.priceEstimate.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between bg-teal-50/60 -mx-4 -mb-4 p-4 rounded-b-2xl border-x-0">
              <div>
                <span className="text-xs font-black text-slate-900 block">TOTAL ESTIMÉ TTC</span>
                <span className="text-[10px] text-teal-800 font-medium">Paiement après intervention</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#00685f] tracking-tight">
                  {totalCalculated.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Artisan Direct Notes */}
          {quote.notes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-[#855300]">
                <FileText className="w-3.5 h-3.5" />
                Note de l'artisan :
              </span>
              <p className="leading-relaxed text-amber-900/90">{quote.notes}</p>
            </div>
          )}

          {/* Safety & Payment Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50/90 border border-teal-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00685f]" />
              <span className="text-xs font-bold text-[#00685f]">
                Garantie Proxi Artisans Bamako
              </span>
            </div>
            <p className="text-[11px] text-teal-950 leading-relaxed">
              Aucun paiement n'est exigé avant l'arrivée de l'artisan. Vous réglez directement après vérification des réparations par <strong>Orange Money</strong>, <strong>Wave</strong> ou <strong>Espèces</strong>.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
          {quote.status === 'received' && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleReject}
                className="h-12 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Décliner le devis</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={isProcessing}
                className="h-12 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Validation...' : 'Accepter le devis'}</span>
              </button>
            </div>
          )}

          {quote.status === 'accepted' && (
            <div className="p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Devis validé ! L'artisan intervient à votre adresse.</span>
              </div>
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(quote);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[11px] hover:bg-emerald-900 shrink-0"
                >
                  Échanger
                </button>
              )}
            </div>
          )}

          {quote.status === 'pending' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>L'artisan étudie votre demande et chiffre les pièces...</span>
              </div>
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(quote);
                  }}
                  className="text-xs font-bold text-[#00685f] underline ml-2 shrink-0"
                >
                  Envoyer un vocal
                </button>
              )}
            </div>
          )}

          {/* Quick Chat Link */}
          {onOpenChat && quote.status !== 'accepted' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChat(quote);
              }}
              className="w-full py-2 text-xs font-bold text-[#00685f] hover:text-[#00574f] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Poser une question ou envoyer un vocal sur ce devis</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
