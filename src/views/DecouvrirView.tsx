import React from 'react';
import { ProductItem, ArtisanItem } from '../types';
import { BAMAKO_MARKETS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { 
  Compass, Store, MapPin, Sparkles, Navigation, ArrowRight, 
  Flame, ShoppingBag, ShieldCheck, Star, ChevronRight, MessageCircle 
} from 'lucide-react';

interface DecouvrirViewProps {
  products: ProductItem[];
  artisans: ArtisanItem[];
  onSelectProduct: (product: ProductItem) => void;
  onSelectArtisanQuote: (artisan: ArtisanItem) => void;
  onStartArtisanChat: (artisan: ArtisanItem) => void;
}

export const DecouvrirView: React.FC<DecouvrirViewProps> = ({
  products,
  artisans,
  onSelectProduct,
  onSelectArtisanQuote,
  onStartArtisanChat,
}) => {
  const { t } = useLanguage();

  const handleOpenMarket = (marketName: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marketName + ', Bamako')}`, '_blank');
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-4 space-y-6">
      {/* Header Discover Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#855300] via-[#ab6b00] to-[#fea619] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-xs font-bold text-amber-100 mb-2">
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>{t('discover.bannerBadge')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black leading-tight">
            {t('discover.bannerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-amber-50 mt-1 max-w-md">
            {t('discover.bannerSubtitle')}
          </p>
        </div>
      </div>

      {/* Section 1: Les Marchés Emblématiques de Bamako */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <Store className="w-5 h-5 text-[#00685f]" />
              <span>{t('discover.marketsTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500">{t('discover.marketsSubtitle')}</p>
          </div>
          <span className="text-xs font-bold text-[#00685f]">{t('discover.activeMarkets', { count: 5 })}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BAMAKO_MARKETS.map((market) => (
            <div
              key={market.id}
              className="clay-card rounded-2xl bg-white p-4 flex flex-col justify-between space-y-3 hover:border-teal-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00685f] transition-colors">
                    {market.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#00685f] border border-teal-200 shrink-0">
                    {market.distance}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
                  <span>{market.quartier}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-medium">{market.openStatus}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {market.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {t('discover.merchantsCount', { count: market.merchantsCount })}
                </span>
                <button
                  onClick={() => handleOpenMarket(market.name)}
                  className="flex items-center gap-1 text-xs font-bold text-[#00685f] hover:underline"
                >
                  <span>{t('discover.goThere')}</span>
                  <Navigation className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Arrivages de la semaine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#855300] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('discover.weeklyArrivals')}</h2>
              <p className="text-xs text-slate-500">{t('discover.weeklyArrivalsDesc')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="clay-card rounded-2xl bg-white p-3 cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {p.stockBadge && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.2 rounded-md bg-[#fea619] text-white text-[9px] font-bold">
                    {p.stockBadge}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold">{p.shopLocation}</span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-[#00685f]">
                  {p.title}
                </h4>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-black text-[#00685f]">
                  {p.price.toLocaleString()} F
                </span>
                <span className="text-[10px] text-slate-400">{t('common.distanceM', { distance: p.distanceKm * 1000 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Artisans Recommandés */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-5 h-5 text-[#00685f]" />
          <span>{t('discover.recommendedArtisansTitle')}</span>
        </h2>

        <div className="space-y-2.5">
          {artisans.slice(0, 3).map((art) => (
            <div
              key={art.id}
              className="clay-card rounded-2xl bg-white p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={art.avatar}
                  alt={art.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{art.name}</h4>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700">{art.rating}</span>
                  </div>
                  <p className="text-[11px] text-[#00685f] font-semibold truncate">{art.trade}</p>
                  <p className="text-[10px] text-slate-400 truncate">{art.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onStartArtisanChat(art)}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00685f] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  title={t('home.chatInApp')}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t('common.chat')}</span>
                </button>
                <button
                  onClick={() => onSelectArtisanQuote(art)}
                  className="px-3 py-1.5 rounded-xl bg-[#00685f] text-white text-xs font-bold hover:bg-[#00574f] active:scale-95 transition-all"
                >
                  {t('discover.quoteBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
