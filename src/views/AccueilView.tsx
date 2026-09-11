import React, { useState, useMemo } from 'react';
import { ProductItem, ArtisanItem } from '../types';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, SlidersHorizontal, MapPin, Heart, Phone, 
  MessageCircle, Navigation, Star, ShieldCheck, 
  Sliders, Layers, Grid, List, Sparkles, Truck, CheckCircle2, ChevronRight, X, FileText 
} from 'lucide-react';

interface AccueilViewProps {
  products: ProductItem[];
  artisans: ArtisanItem[];
  onSelectProduct: (product: ProductItem) => void;
  onSelectArtisanQuote: (artisan: ArtisanItem) => void;
  onToggleFavorite: (id: string) => void;
  onStartArtisanChat: (artisan: ArtisanItem) => void;
  onStartProductChat: (product: ProductItem) => void;
  activeQuartier: string;
  onOpenQuotes?: () => void;
  quotesCount?: number;
}

export const AccueilView: React.FC<AccueilViewProps> = ({
  products,
  artisans,
  onSelectProduct,
  onSelectArtisanQuote,
  onToggleFavorite,
  onStartArtisanChat,
  onStartProductChat,
  activeQuartier,
  onOpenQuotes,
  quotesCount,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'produits' | 'services'>('produits');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [maxRadiusKm, setMaxRadiusKm] = useState(5);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'tous', label: t('home.catAll') },
    { id: 'bazin', label: t('home.catBazin') },
    { id: 'solaire', label: t('home.catSolar') },
    { id: 'moto', label: t('home.catMoto') },
    { id: 'alimentation', label: t('home.catFood') },
    { id: 'btp', label: t('home.catBtp') },
    { id: 'couture', label: t('home.catSewing') },
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shopLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'tous' || p.category === selectedCategory;
      const matchDist = p.distanceKm <= maxRadiusKm;
      return matchSearch && matchCat && matchDist;
    });
  }, [products, searchQuery, selectedCategory, maxRadiusKm]);

  // Filter artisans
  const filteredArtisans = useMemo(() => {
    return artisans.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'tous' || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [artisans, searchQuery, selectedCategory]);

  const handleDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Bamako, Mali')}`, '_blank');
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-4 space-y-4">
      {/* PWA Banner if applicable */}
      <PWAInstallBanner />

      {/* Hero Welcome banner */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#00685f] via-[#008378] to-[#17684e] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-[#89f5e7] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
            <span>{t('home.heroBadge')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 leading-relaxed max-w-lg">
            {t('home.heroSubtitle', { district: activeQuartier })}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white border border-slate-200/90 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00685f] focus:ring-2 focus:ring-teal-100 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-3.5 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition-colors shadow-xs ${
              showFilters
                ? 'bg-[#00685f] text-white border-[#00685f]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t('home.filters')}</span>
          </button>
        </div>

        {/* Expandable Radius & Filter Controls */}
        {showFilters && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{t('home.radiusTitle')}</span>
              <span className="font-extrabold text-[#00685f] bg-teal-50 px-2 py-0.5 rounded-lg">
                {t('home.radiusUpTo', { radius: maxRadiusKm })}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-[#00685f] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>{t('home.radiusNeighborhood')}</span>
              <span>{t('home.radiusCommune')}</span>
              <span>{t('home.radiusGreater')}</span>
            </div>
          </div>
        )}

        {/* Segmented Switcher: Produits vs Services & Artisans */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('produits')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'produits'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t('home.productsTab')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-[#00685f] text-[10px]">
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-white text-[#855300] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t('home.servicesTab')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-[#855300] text-[10px]">
              {filteredArtisans.length}
            </span>
          </button>
        </div>

        {/* View mode toggle (List vs Map) */}
        <div className="flex items-center justify-between pt-1">
          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 mr-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#00685f] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-teal-50 text-[#00685f]' : 'text-slate-400'}`}
              title={t('home.viewList')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-teal-50 text-[#00685f]' : 'text-slate-400'}`}
              title={t('home.viewMap')}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAP VIEW MODE OVERLAY */}
      {viewMode === 'map' && (
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 h-96 relative shadow-md">
          {/* Interactive Simulated Map */}
          <div className="absolute inset-0 bg-slate-900 bg-[radial-gradient(#1e3a5f_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-80" />
          
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#fea619]" />
            <span>{t('home.mapTitle', { district: activeQuartier })}</span>
          </div>

          {/* Map Pins */}
          {products.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform hover:scale-110"
              style={{
                top: `${28 + (idx * 16)}%`,
                left: `${22 + (idx * 15)}%`,
              }}
            >
              <div className="px-2 py-1 rounded-lg bg-white text-slate-900 font-bold text-[11px] shadow-md border border-teal-600 whitespace-nowrap">
                {p.price.toLocaleString()} F
              </div>
              <div className="w-4 h-4 rounded-full bg-[#00685f] ring-4 ring-white/50 -mt-1 shadow-md" />
            </button>
          ))}
        </div>
      )}

      {/* LIST VIEW: PRODUCTS */}
      {viewMode === 'list' && activeTab === 'produits' && (
        <div className="space-y-3.5">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">{t('home.noProductsInRadius')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('home.noProductsInRadiusDesc')}</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="clay-card rounded-3xl bg-white p-3 sm:p-4 transition-all duration-200 hover:shadow-lg relative group"
              >
                <div className="flex gap-3.5">
                  {/* Product Thumbnail */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stockBadge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#fea619] text-white text-[10px] font-black uppercase tracking-tight shadow-xs">
                        {product.stockBadge}
                      </span>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-semibold text-slate-500 truncate">
                          {product.shopName}
                        </span>
                        <button
                          onClick={() => onToggleFavorite(product.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          title={t('favorites.title')}
                        >
                          <Heart
                            className={`w-4 h-4 ${product.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                        </button>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-bold text-slate-900 text-sm sm:text-base leading-snug hover:text-[#00685f] cursor-pointer line-clamp-2 mt-0.5"
                      >
                        {product.title}
                      </h3>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
                        <span className="truncate">{product.shopLocation}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#00685f] font-semibold">{t('common.distanceM', { distance: product.distanceKm * 1000 })}</span>
                      </div>
                    </div>

                    {/* Price and Instant Actions */}
                    <div className="flex items-end justify-between gap-2 pt-2">
                      <div>
                        <div className="text-base sm:text-lg font-black text-[#00685f] tracking-tight">
                          {product.price.toLocaleString()} FCFA
                        </div>
                        {product.unit && (
                          <div className="text-[10px] text-slate-400 leading-tight">{product.unit}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDirections(product.address)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                          title={t('common.directions')}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onStartProductChat(product)}
                          className="px-2.5 h-8 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00685f] border border-teal-200/80 flex items-center gap-1 transition-colors shadow-2xs text-xs font-bold active:scale-95"
                          title={t('home.chatInApp')}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('home.chat')}</span>
                        </button>
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="px-3 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                        >
                          {t('home.viewProduct')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST VIEW: SERVICES & ARTISANS */}
      {viewMode === 'list' && activeTab === 'services' && (
        <div className="space-y-3.5">
          {/* In-app chat reassurance notice */}
          <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200/70 flex items-center gap-2.5 text-xs text-teal-950">
            <div className="w-7 h-7 rounded-xl bg-[#00685f] text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <p className="leading-snug">
              <span className="font-bold">{t('home.inAppChatNoticeTitle')}</span> {t('home.inAppChatNoticeDesc')}
            </p>
          </div>

          {/* Direct shortcut to consult quotes */}
          {onOpenQuotes && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#855300] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{t('home.myArtisanQuotes')}</h4>
                  <p className="text-[11px] text-slate-600 truncate">
                    {quotesCount ? t('home.quotesCount', { count: quotesCount, plural: quotesCount > 1 ? 's' : '' }) : t('home.quotesDefaultDesc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenQuotes}
                className="px-3 py-1.5 rounded-xl bg-[#855300] hover:bg-[#6c4300] text-white text-xs font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-xs"
              >
                <span>{t('common.view')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filteredArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className="clay-card rounded-3xl bg-white p-4 transition-all duration-200 hover:shadow-lg relative"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {artisan.name}
                      </h3>
                      {artisan.verified && (
                        <ShieldCheck className="w-4 h-4 text-[#00685f] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 text-xs font-bold text-amber-900 shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{artisan.rating}</span>
                      <span className="text-[10px] text-slate-400">({t('common.reviews', { count: artisan.reviewsCount })})</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#00685f] mt-0.5">{artisan.trade}</p>
                  
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
                    <span className="truncate">{artisan.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {artisan.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 mt-1 border-t border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.indicativeRate')}</span>
                      <div className="text-sm font-black text-[#855300] leading-tight">
                        {artisan.priceNote}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { window.location.href = `tel:${artisan.phone}`; }}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors shadow-2xs"
                        title={t('common.call')}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartArtisanChat(artisan)}
                        className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00685f] text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                        title={t('home.chatInApp')}
                      >
                        <MessageCircle className="w-4 h-4 text-[#00685f]" />
                        <span>{t('home.chat')}</span>
                      </button>
                      <button
                        onClick={() => onSelectArtisanQuote(artisan)}
                        className="px-3 py-2 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                      >
                        {t('home.requestQuote')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
