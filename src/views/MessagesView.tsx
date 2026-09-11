import React, { useState } from 'react';
import { ConversationThread, QuoteItem, QuoteStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  MessageSquare, ShieldCheck, CheckCheck, FileText, 
  Store, Wrench, Search, Phone, Clock, CheckCircle2, 
  XCircle, ChevronRight, Eye, Calendar, MapPin, AlertCircle 
} from 'lucide-react';

interface MessagesViewProps {
  threads: ConversationThread[];
  quotes: QuoteItem[];
  onSelectThread: (thread: ConversationThread) => void;
  onSelectQuote: (quote: QuoteItem) => void;
  initialTab?: 'conversations' | 'devis';
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  threads,
  quotes,
  onSelectThread,
  onSelectQuote,
  initialTab = 'conversations',
}) => {
  const { t } = useLanguage();
  const [mainTab, setMainTab] = useState<'conversations' | 'devis'>(initialTab);
  const [filterCategory, setFilterCategory] = useState<'all' | 'orders' | 'artisans'>('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Filtered threads
  const filteredThreads = threads.filter((t) => {
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    const matchSearch =
      t.contactName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
    const matchSearch =
      q.artisanName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.project.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.reference.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.artisanTrade.toLowerCase().includes(searchFilter.toLowerCase());
    return matchStatus && matchSearch;
  });

  const ordersCount = threads.filter((t) => t.category === 'orders').length;
  const artisansCount = threads.filter((t) => t.category === 'artisans').length;

  const quotesReceivedCount = quotes.filter((q) => q.status === 'received').length;
  const quotesAcceptedCount = quotes.filter((q) => q.status === 'accepted').length;
  const quotesCompletedCount = quotes.filter((q) => q.status === 'completed').length;

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-[#855300] border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{t('messages.quoteReceived')}</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('messages.quoteAcceptedBadge')}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>{t('messages.quoteRejectedBadge')}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{t('messages.quoteCompletedBadge')}</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>{t('messages.quotePendingBadge')}</span>
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('messages.title')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('messages.subtitle')}
          </p>
        </div>
      </div>

      {/* Master Toggle: Discussions vs Mes Devis */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-inner">
        <button
          type="button"
          onClick={() => setMainTab('conversations')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mainTab === 'conversations'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#00685f]" />
          <span>{t('messages.threadsTab', { count: threads.length })}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('devis')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${
            mainTab === 'devis'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#855300]" />
          <span>{t('messages.quotesTab', { count: quotes.length })}</span>
          {quotesReceivedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#fea619] text-white text-[10px] font-black shadow-2xs">
              {quotesReceivedCount}
            </span>
          )}
        </button>
      </div>

      {/* Relais Local Secure Notice */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50/80 border border-teal-200/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-teal-950 leading-snug">
          <span className="font-bold">{t('messages.proxiGuaranteeTitle')}</span> {t('messages.proxiGuaranteeDesc')}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder={mainTab === 'conversations' ? t('messages.searchThreads') : t('messages.searchQuotes')}
          className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:border-[#00685f] focus:outline-none shadow-2xs"
        />
      </div>

      {/* TAB CONTENT 1: CONVERSATIONS */}
      {mainTab === 'conversations' && (
        <div className="space-y-3">
          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                filterCategory === 'all'
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('messages.allThreads', { count: threads.length })}
            </button>

            <button
              onClick={() => setFilterCategory('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                filterCategory === 'orders'
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('messages.shopsFilter', { count: ordersCount })}</span>
            </button>

            <button
              onClick={() => setFilterCategory('artisans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                filterCategory === 'artisans'
                  ? 'bg-[#855300] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{t('messages.artisansFilter', { count: artisansCount })}</span>
            </button>
          </div>

          {/* Threads List */}
          <div className="space-y-2.5">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className="clay-card rounded-2xl bg-white p-3.5 sm:p-4 hover:border-teal-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={thread.avatar}
                      alt={thread.contactName}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                    {thread.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00685f] transition-colors truncate">
                          {thread.contactName}
                        </h3>
                        {thread.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00685f] shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {thread.lastTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate leading-tight">
                      {thread.contactSubtitle}
                    </p>

                    <p className="text-xs text-slate-700 font-medium mt-1.5 line-clamp-1 leading-snug">
                      {thread.lastMessage}
                    </p>

                    {/* Attached Product preview badge */}
                    {thread.productPreview && (
                      <div className="mt-2 inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]">
                        <img
                          src={thread.productPreview.image}
                          alt={thread.productPreview.title}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {thread.productPreview.title}
                        </span>
                        <span className="font-bold text-[#00685f]">{thread.productPreview.price}</span>
                      </div>
                    )}

                    {/* Attached Quote badge */}
                    {thread.quotePreview && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-[#855300] font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{thread.quotePreview.title} • {thread.quotePreview.price}</span>
                      </div>
                    )}
                  </div>

                  {thread.unreadCount > 0 && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-[#fea619] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MES DEVIS (QUOTES CONSULTATION) */}
      {mainTab === 'devis' && (
        <div className="space-y-3">
          {/* Quotes Filter Sub-Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setQuoteStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                quoteStatusFilter === 'all'
                  ? 'bg-[#855300] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('messages.quotesFilterAll', { count: quotes.length })}
            </button>

            <button
              onClick={() => setQuoteStatusFilter('received')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                quoteStatusFilter === 'received'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{t('messages.quotesFilterReceived', { count: quotesReceivedCount })}</span>
            </button>

            <button
              onClick={() => setQuoteStatusFilter('accepted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                quoteStatusFilter === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{t('messages.quotesFilterAccepted', { count: quotesAcceptedCount })}</span>
            </button>

            <button
              onClick={() => setQuoteStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                quoteStatusFilter === 'completed'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{t('messages.quotesFilterCompleted', { count: quotesCompletedCount })}</span>
            </button>
          </div>

          {/* Quotes Cards Stream */}
          {filteredQuotes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#855300] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t('messages.noQuotesTitle')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t('messages.noQuotesDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="clay-card rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3.5 hover:border-amber-300 transition-all"
                >
                  {/* Card Header: Reference & Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {quote.reference}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {quote.createdAt}
                      </span>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>

                  {/* Artisan Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={quote.artisanAvatar}
                      alt={quote.artisanName}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-teal-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {quote.artisanName}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00685f] shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate">
                        {quote.artisanTrade}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
                        <span>{quote.artisanLocation}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[#855300] text-[10px] font-bold shrink-0 border border-amber-200/60">
                      {quote.urgency}
                    </span>
                  </div>

                  {/* Project Title */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('messages.requestNature')}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {quote.project}
                    </h5>
                    {quote.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                        « {quote.description} »
                      </p>
                    )}
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {t('messages.estimatedTotal')}
                      </span>
                      <span className="text-lg font-black text-[#00685f] tracking-tight">
                        {quote.priceEstimate.toLocaleString()} FCFA
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectQuote(quote)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{t('messages.consultQuote')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const matchingThread = threads.find(
                            (t) => t.id === quote.threadId || t.contactName === quote.artisanName || t.phone === quote.artisanPhone
                          );
                          if (matchingThread) {
                            onSelectThread(matchingThread);
                          } else {
                            onSelectQuote(quote);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title={t('messages.openDiscussion')}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <a
                        href={`tel:${quote.artisanPhone}`}
                        className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00685f] transition-colors"
                        title={t('messages.callArtisan')}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
