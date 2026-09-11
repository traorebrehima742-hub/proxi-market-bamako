import React, { useState } from 'react';
import { ProductItem } from '../types';
import { 
  X, Heart, Share2, MapPin, Clock, ShieldCheck, 
  Phone, MessageCircle, Truck, Check, Store 
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onOrder: (product: ProductItem) => void;
  onStartChat: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onToggleFavorite,
  onOrder,
  onStartChat,
}) => {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCall = () => {
    window.location.href = `tel:${product.phone}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Regarde cet article sur Proxi Market Bamako : ${product.title} à ${product.price.toLocaleString()} FCFA`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${product.title} - ${product.price.toLocaleString()} FCFA sur Proxi Market`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden flex flex-col shadow-2xl relative"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Close and Actions Floating Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-700 shadow-md flex items-center justify-center pointer-events-auto transition-transform active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-700 shadow-md flex items-center justify-center transition-transform active:scale-95"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onToggleFavorite(product.id)}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-rose-500 shadow-md flex items-center justify-center transition-transform active:scale-95"
              title="Ajouter aux favoris"
            >
              <Heart className={`w-5 h-5 ${product.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Image hero banner */}
          <div className="relative w-full h-72 bg-slate-100">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[#00685f]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Store className="w-3.5 h-3.5" />
              <span>{product.shopName}</span>
            </div>
            {product.stockBadge && (
              <div className="absolute bottom-3 right-3 bg-[#fea619] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {product.stockBadge}
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Title & Price */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-black text-[#00685f] tracking-tight">
                  {product.price.toLocaleString()} FCFA
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-slate-400 line-through">
                    {product.originalPrice.toLocaleString()} FCFA
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
                {product.title}
              </h2>
              {product.unit && (
                <p className="text-xs text-slate-500 mt-0.5">{product.unit}</p>
              )}
            </div>

            {/* Shop location card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span className="flex items-center gap-1.5 text-[#00685f]">
                  <MapPin className="w-4 h-4 text-[#fea619]" />
                  <span>{product.shopLocation} (à {product.distanceKm * 1000} m)</span>
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Ouvert maintenant
                </span>
              </div>
              <p className="text-xs text-slate-600 pl-5 leading-tight">{product.address}</p>
              <div className="flex items-center gap-2 pl-5 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Horaires : {product.hours}</span>
              </div>
            </div>

            {/* Guaranteed Trust Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00685f] shrink-0" />
                <span className="text-xs font-semibold text-teal-900">Paiement à la livraison</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#855300] shrink-0" />
                <span className="text-xs font-semibold text-amber-900">Livraison rapide ~20min</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description de l'article
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 pb-safe">
          <button
            onClick={handleCall}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors active:scale-95"
            title="Appeler le commerçant"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              onClose();
              onStartChat(product);
            }}
            className="px-4 h-12 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00685f] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95 shrink-0"
            title="Discuter directement dans l'application"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discuter</span>
          </button>
          <button
            onClick={() => onOrder(product)}
            className="flex-1 h-12 rounded-2xl bg-[#00685f] hover:bg-[#00574f] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Truck className="w-4 h-4 text-[#89f5e7]" />
            <span>Commander en livraison</span>
          </button>
        </div>
      </div>
    </div>
  );
};
