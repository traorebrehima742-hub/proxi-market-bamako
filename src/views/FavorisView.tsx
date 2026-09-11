import React, { useState } from 'react';
import { ProductItem, ArtisanItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Heart, Share2, BellRing, MapPin, Store, Wrench, 
  Trash2, Navigation, MessageCircle, Star, ShieldCheck 
} from 'lucide-react';

interface FavorisViewProps {
  products: ProductItem[];
  artisans: ArtisanItem[];
  onSelectProduct: (product: ProductItem) => void;
  onSelectArtisanQuote: (artisan: ArtisanItem) => void;
  onToggleFavoriteProduct: (id: string) => void;
  onStartArtisanChat: (artisan: ArtisanItem) => void;
}

export const FavorisView: React.FC<FavorisViewProps> = ({
  products,
  artisans,
  onSelectProduct,
  onSelectArtisanQuote,
  onToggleFavoriteProduct,
  onStartArtisanChat,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'articles' | 'artisans'>('articles');

  const favoriteProducts = products.filter((p) => p.isFavorite);
  const favoriteArtisans = artisans.filter((a) => a.isFavorite);

  const handleShare = (title: string, price: number) => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `Regarde ${title} à ${price.toLocaleString()} FCFA sur Proxi Market`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title} - ${price.toLocaleString()} FCFA sur Proxi Market`);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t('favorites.title')}</h1>
          <p className="text-xs text-slate-500">{t('favorites.subtitle')}</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
          <Heart className="w-4 h-4 fill-rose-600" />
        </div>
      </div>

      {/* Price Drop Alert Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#855300] text-white flex items-center justify-center shrink-0">
          <BellRing className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-amber-950 leading-snug">
          <span className="font-bold">{t('favorites.alertTitle')} :</span> {t('favorites.alertText')}
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'articles'
              ? 'bg-white text-[#00685f] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('favorites.savedArticles', { count: favoriteProducts.length })}
        </button>
        <button
          onClick={() => setActiveTab('artisans')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'artisans'
              ? 'bg-white text-[#855300] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('favorites.savedArtisans', { count: favoriteArtisans.length })}
        </button>
      </div>

      {/* TAB 1: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-200">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">{t('favorites.emptyTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('favorites.emptyDesc')}
              </p>
            </div>
          ) : (
            favoriteProducts.map((p) => (
              <div
                key={p.id}
                className="clay-card rounded-2xl bg-white p-3.5 flex gap-3.5 hover:shadow-md transition-all relative group"
              >
                <div
                  onClick={() => onSelectProduct(p)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                >
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
                        {p.shopName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleShare(p.title, p.price)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title={t('common.share')}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleFavoriteProduct(p.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                          title={t('favorites.title')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(p)}
                      className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug cursor-pointer hover:text-[#00685f]"
                    >
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-[#fea619]" />
                      <span>{p.shopLocation}</span>
                      <span>•</span>
                      <span className="text-[#00685f] font-semibold">{t('common.distanceM', { distance: p.distanceKm * 1000 })}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mt-1">
                    <span className="text-sm sm:text-base font-black text-[#00685f]">
                      {p.price.toLocaleString()} FCFA
                    </span>
                    <button
                      onClick={() => onSelectProduct(p)}
                      className="px-3 py-1.5 rounded-xl bg-[#00685f] text-white text-xs font-bold hover:bg-[#00574f] active:scale-95 transition-all"
                    >
                      {t('common.order')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ARTISANS */}
      {activeTab === 'artisans' && (
        <div className="space-y-3">
          {favoriteArtisans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-200">
              <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">{t('favorites.emptyTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('favorites.emptyDesc')}
              </p>
            </div>
          ) : (
            favoriteArtisans.map((art) => (
              <div
                key={art.id}
                className="clay-card rounded-2xl bg-white p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={art.avatar}
                    alt={art.name}
                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{art.name}</h4>
                      <ShieldCheck className="w-4 h-4 text-[#00685f] shrink-0" />
                    </div>
                    <p className="text-xs font-semibold text-[#00685f] truncate">{art.trade}</p>
                    <p className="text-[11px] text-slate-500 truncate">{art.location}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-900">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{art.rating}</span>
                      <span className="text-[10px] text-slate-400">({t('common.reviews', { count: art.reviewsCount })})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onStartArtisanChat(art)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00685f] text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                    title={t('home.chatInApp')}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('home.chat')}</span>
                  </button>
                  <button
                    onClick={() => onSelectArtisanQuote(art)}
                    className="px-3 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white text-xs font-bold transition-colors shadow-xs active:scale-95"
                  >
                    {t('home.requestQuote')}
                  </button>
                  <button
                    onClick={() => { window.location.href = `tel:${art.phone}`; }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    {t('home.call')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
