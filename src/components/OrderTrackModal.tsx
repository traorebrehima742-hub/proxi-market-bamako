import React from 'react';
import { OrderTrackInfo } from '../types';
import { X, Phone, MessageSquare, MapPin, Bike, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OrderTrackModalProps {
  order: OrderTrackInfo;
  onClose: () => void;
  onOpenChatWithCourier: () => void;
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({
  order,
  onClose,
  onOpenChatWithCourier,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-slate-600 hover:text-slate-900 shadow-md flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Visual Map Simulation */}
        <div className="relative h-44 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center overflow-hidden">
          {/* Street grid visual lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated route line */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 60,110 Q 180,40 320,80"
              fill="none"
              stroke="#fea619"
              strokeWidth="4"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Courier Pin animation */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shadow-xl ring-4 ring-white/30 animate-bounce">
              <Bike className="w-8 h-8 text-[#fea619]" />
            </div>
            <div className="mt-2 px-3 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Arrivée estimée dans ~{order.etaMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider">
                Commande {order.orderId}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{order.itemTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total : {order.priceFCFA.toLocaleString()} FCFA</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              En route
            </span>
          </div>

          {/* Courier details card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-[#00685f] flex items-center justify-center font-bold text-sm">
                OT
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{order.courierName}</h4>
                <p className="text-[11px] text-slate-500">{order.vehicle}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Livreur certifié Bamako</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { window.location.href = `tel:${order.courierPhone}`; }}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shadow-xs"
                title="Appeler le coursier"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenChatWithCourier}
                className="w-10 h-10 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white flex items-center justify-center shadow-xs"
                title="Envoyer un message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery Steps Timeline */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>14:05 • Commande préparée et emballée</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>14:15 • Colis récupéré par Ousmane T. (Livraison rapide)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <span className="w-4 h-4 rounded-full bg-[#00685f] text-white flex items-center justify-center text-[10px] shrink-0">3</span>
              <span className="text-[#00685f]">En cours d'acheminement vers {order.destinationAddress}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Fermer le suivi
          </button>
        </div>
      </div>
    </div>
  );
};
