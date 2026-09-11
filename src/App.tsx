import React, { useState, useEffect } from 'react';
import { ProductItem, ArtisanItem, ConversationThread, UserProfile, QuoteItem, QuoteStatus, ThemeMode } from './types';
import { Storage } from './lib/storage';
import { INITIAL_ARTISANS, ACTIVE_ORDER } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { AccueilView } from './views/AccueilView';
import { DecouvrirView } from './views/DecouvrirView';
import { MessagesView } from './views/MessagesView';
import { FavorisView } from './views/FavorisView';
import { ProfilView } from './views/ProfilView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuoteModal } from './components/QuoteModal';
import { QuoteDetailModal } from './components/QuoteDetailModal';
import { OrderTrackModal } from './components/OrderTrackModal';
import { PaymentModal } from './components/PaymentModal';
import { ChatModal } from './components/ChatModal';
import { AuthModal } from './components/AuthModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { QuartierModal } from './components/QuartierModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [user, setUser] = useState<UserProfile>(() => Storage.getUser());
  const [products, setProducts] = useState<ProductItem[]>(() => Storage.getProducts());
  const [artisans] = useState<ArtisanItem[]>(INITIAL_ARTISANS);
  const [threads, setThreads] = useState<ConversationThread[]>(() => Storage.getThreads());
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => Storage.getQuotes());
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [messagesInitialTab, setMessagesInitialTab] = useState<'conversations' | 'devis'>('conversations');
  const [activeQuartier, setActiveQuartier] = useState<string>(user?.quartier || 'Hamdallaye ACI');
  const [theme, setTheme] = useState<ThemeMode>(() => Storage.getTheme());

  // Apply Theme to Document (Night Mode / Light Mode / Auto)
  useEffect(() => {
    const applyTheme = (currentTheme: ThemeMode) => {
      const root = document.documentElement;
      const body = document.body;
      let isDark = false;

      if (currentTheme === 'dark') {
        isDark = true;
      } else if (currentTheme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    applyTheme(theme);

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    Storage.saveTheme(newTheme);
    setUser((prev) => ({ ...prev, theme: newTheme }));
    if (newTheme === 'dark') {
      showToast('🌙 Mode Nuit activé (Teinte reposante de Bamako)');
    } else if (newTheme === 'light') {
      showToast('☀️ Mode Jour activé (Thème clair)');
    } else {
      showToast('💻 Thème synchronisé avec votre appareil');
    }
  };

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedArtisanForQuote, setSelectedArtisanForQuote] = useState<ArtisanItem | null>(null);
  const [selectedProductForPayment, setSelectedProductForPayment] = useState<ProductItem | null>(null);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Storage.isLoggedIn());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => !Storage.isLoggedIn());
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isOrderTrackOpen, setIsOrderTrackOpen] = useState(false);
  const [isQuartierModalOpen, setIsQuartierModalOpen] = useState(false);

  // Prevent background scrolling whenever on the login page OR when not logged in
  useEffect(() => {
    const shouldLockScroll = isAuthOpen || !isLoggedIn;

    if (shouldLockScroll) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('scroll-locked');
      document.documentElement.classList.add('scroll-locked');

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.classList.remove('scroll-locked');
        document.documentElement.classList.remove('scroll-locked');
        window.scrollTo(0, scrollY);
      };
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    }
  }, [isAuthOpen, isLoggedIn]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Toggle Favorite Product
  const handleToggleFavorite = (productId: string) => {
    const updated = Storage.toggleFavorite(productId);
    setProducts(updated);
    const target = updated.find((p) => p.id === productId);
    if (target) {
      showToast(target.isFavorite ? `"${target.title}" ajouté à vos favoris` : `Article retiré des favoris`);
    }
  };

  // Handle Quote Submission
  const handleSubmitQuote = (
    artisan: ArtisanItem,
    details: { project: string; urgency: string; address: string; description: string }
  ) => {
    const thread = Storage.getOrCreateArtisanThread(artisan);
    const newMsgText = `Demande de devis : ${details.project} (${details.urgency}) à ${details.address}. ${details.description}`;
    const updatedThreads = Storage.sendThreadMessage(thread.id, newMsgText, 'user');
    setThreads(updatedThreads);

    // Create persistent structured QuoteItem
    const newQuote: QuoteItem = {
      id: `quote_${Date.now()}`,
      reference: `DEV-2026-${Math.floor(100 + Math.random() * 900)}`,
      artisanId: artisan.id,
      artisanName: artisan.name,
      artisanTrade: artisan.trade,
      artisanAvatar: artisan.avatar,
      artisanPhone: artisan.phone,
      artisanLocation: artisan.location,
      clientName: user.name,
      clientPhone: user.phone,
      clientAddress: details.address || `${user.quartier}, Bamako`,
      project: details.project,
      description: details.description,
      urgency: details.urgency,
      createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: new Date(Date.now() + 7 * 86400000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: 'pending',
      priceEstimate: artisan.minPrice || 4000,
      breakdown: [
        { label: 'Diagnostic initial et main d’œuvre', amount: artisan.minPrice || 3000 },
        { label: 'Frais de déplacement atelier', amount: 1000 },
      ],
      threadId: thread.id,
      notes: 'Demande enregistrée. L’artisan vous répondra avec un montant précis sous peu.',
    };

    const updatedQuotes = Storage.addQuote(newQuote);
    setQuotes(updatedQuotes);

    setSelectedThread(updatedThreads.find((t) => t.id === thread.id) || thread);
    showToast(`Demande de devis transmise avec succès à ${artisan.name}`);
  };

  // Open Quotes consultation directly
  const handleOpenQuotesView = () => {
    setMessagesInitialTab('devis');
    setActiveTab('messages');
  };

  // Handle quote status update (Accept, Reject, Completed)
  const handleQuoteStatusChange = (quoteId: string, status: QuoteStatus) => {
    const updated = Storage.updateQuoteStatus(quoteId, status);
    setQuotes(updated);
    if (selectedQuote && selectedQuote.id === quoteId) {
      setSelectedQuote({ ...selectedQuote, status });
    }
    const statusLabels: Record<QuoteStatus, string> = {
      received: 'Devis reçu avec estimation chiffrée',
      accepted: 'Devis validé ! L\'artisan est informé.',
      rejected: 'Devis décliné',
      completed: 'Prestation clôturée avec succès',
      pending: 'Demande en attente de réponse',
    };
    showToast(statusLabels[status] || 'Statut du devis actualisé');
  };

  // Open quote details from chat thread
  const handleOpenQuoteDetailFromThread = (thread: ConversationThread) => {
    let found = quotes.find(
      (q) =>
        q.threadId === thread.id ||
        q.artisanName === thread.contactName ||
        (thread.phone && thread.phone.replace(/\s+/g, '') === q.artisanPhone.replace(/\s+/g, ''))
    );

    if (!found && thread.quotePreview) {
      found = {
        id: `quote_thread_${thread.id}`,
        reference: `DEV-2026-${Math.floor(100 + Math.random() * 900)}`,
        artisanId: 'art-1',
        artisanName: thread.contactName,
        artisanTrade: thread.contactSubtitle || 'Artisan Qualifié Bamako',
        artisanAvatar: thread.avatar,
        artisanPhone: thread.phone,
        artisanLocation: user?.quartier || 'Bamako',
        clientName: user.name,
        clientPhone: user.phone,
        clientAddress: `${user.quartier}, Bamako`,
        project: thread.quotePreview.title,
        description: 'Intervention et réparations convenues avec l’artisan.',
        urgency: 'Intervention planifiée',
        createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + thread.lastTime,
        validUntil: new Date(Date.now() + 7 * 86400000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        status: 'received',
        priceEstimate: parseInt(thread.quotePreview.price.replace(/[^0-9]/g, ''), 10) || 4000,
        breakdown: [
          { label: 'Diagnostic carburation et réglage pièces', amount: 3000 },
          { label: 'Frais de déplacement', amount: 1000 },
        ],
        threadId: thread.id,
        notes: 'Paiement à la livraison des travaux après essai concluant.',
      };
      const updated = Storage.addQuote(found);
      setQuotes(updated);
    }

    if (found) {
      setSelectedQuote(found);
    }
  };

  // Handle Direct In-App Chat with Artisan
  const handleStartArtisanChat = (artisan: ArtisanItem) => {
    const thread = Storage.getOrCreateArtisanThread(artisan);
    const current = Storage.getThreads();
    setThreads(current);
    setSelectedThread(thread);
  };

  // Handle Direct In-App Chat with Merchant
  const handleStartProductChat = (product: ProductItem) => {
    const thread = Storage.getOrCreateProductThread(product);
    const current = Storage.getThreads();
    setThreads(current);
    setSelectedThread(thread);
  };

  // Refresh threads from storage
  const handleThreadsUpdate = () => {
    const current = Storage.getThreads();
    setThreads(current);
    if (selectedThread) {
      const refreshed = current.find((t) => t.id === selectedThread.id) || null;
      setSelectedThread(refreshed);
    }
  };

  // Handle Order Success
  const handleOrderSuccess = (orderTitle: string) => {
    showToast(`Commande confirmée pour "${orderTitle}". Livraison rapide en cours.`);
    setIsOrderTrackOpen(true);
  };

  const unreadMessagesCount = threads.reduce((acc, t) => acc + (t.unreadCount > 0 ? 1 : 0), 0);
  const favoritesCount = products.filter((p) => p.isFavorite).length;

  return (
    <div className={`min-h-screen bg-[#f8f9ff] dark:bg-[#0a111a] text-[#0b1c30] dark:text-[#f1f5f9] flex flex-col antialiased selection:bg-teal-200 dark:selection:bg-teal-900 transition-colors duration-200 ${(isAuthOpen || !isLoggedIn) ? 'h-screen overflow-hidden' : ''}`}>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        onOpenProfile={() => {
          if (isLoggedIn) {
            setActiveTab('profil');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        activeQuartier={activeQuartier}
        onSelectQuartier={() => setIsQuartierModalOpen(true)}
        unreadNotifications={1}
        onNotificationClick={() => showToast('Notification : Le coursier Ousmane T. est en route pour Hamdallaye ACI 2000.')}
      />

      {/* Main Screen Body Viewport */}
      <main className="flex-1 w-full max-w-2xl mx-auto pt-16">
        {activeTab === 'accueil' && (
          <AccueilView
            products={products}
            artisans={artisans}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectArtisanQuote={(a) => setSelectedArtisanForQuote(a)}
            onToggleFavorite={handleToggleFavorite}
            onStartArtisanChat={handleStartArtisanChat}
            onStartProductChat={handleStartProductChat}
            activeQuartier={activeQuartier}
            onOpenQuotes={handleOpenQuotesView}
            quotesCount={quotes.length}
          />
        )}

        {activeTab === 'decouvrir' && (
          <DecouvrirView
            products={products}
            artisans={artisans}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectArtisanQuote={(a) => setSelectedArtisanForQuote(a)}
            onStartArtisanChat={handleStartArtisanChat}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            threads={threads}
            quotes={quotes}
            onSelectThread={(t) => setSelectedThread(t)}
            onSelectQuote={(q) => setSelectedQuote(q)}
            initialTab={messagesInitialTab}
          />
        )}

        {activeTab === 'favoris' && (
          <FavorisView
            products={products}
            artisans={artisans}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectArtisanQuote={(a) => setSelectedArtisanForQuote(a)}
            onToggleFavoriteProduct={handleToggleFavorite}
            onStartArtisanChat={handleStartArtisanChat}
          />
        )}

        {activeTab === 'profil' && (
          <ProfilView
            user={user}
            onUserUpdate={(u) => setUser(u)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenOrderTrack={() => setIsOrderTrackOpen(true)}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenQuotes={handleOpenQuotesView}
            quotesCount={quotes.length}
            theme={theme}
            onThemeChange={handleThemeChange}
            onShowToast={showToast}
            onLogout={() => {
              setIsLoggedIn(false);
              setIsAuthOpen(true);
              setActiveTab('accueil');
              showToast('Vous avez été déconnecté avec succès.');
            }}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => {
          if (t === 'messages') {
            setMessagesInitialTab('conversations');
          }
          setActiveTab(t);
        }}
        unreadMessagesCount={unreadMessagesCount}
        favoritesCount={favoritesCount}
      />

      {/* MODALS */}
      {/* Product Details Sheet */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onToggleFavorite={handleToggleFavorite}
        onStartChat={handleStartProductChat}
        onOrder={(p) => {
          setSelectedProduct(null);
          setSelectedProductForPayment(p);
        }}
      />

      {/* Request Artisan Quote Modal */}
      <QuoteModal
        artisan={selectedArtisanForQuote}
        onClose={() => setSelectedArtisanForQuote(null)}
        onSubmitQuote={handleSubmitQuote}
        onStartChat={handleStartArtisanChat}
      />

      {/* Dedicated Quote Consultation & Validation Modal */}
      <QuoteDetailModal
        quote={selectedQuote}
        onClose={() => setSelectedQuote(null)}
        onStatusChange={handleQuoteStatusChange}
        onOpenChat={(q) => {
          const matchingThread = threads.find(
            (t) =>
              t.id === q.threadId ||
              t.contactName === q.artisanName ||
              (t.phone && t.phone.replace(/\s+/g, '') === q.artisanPhone.replace(/\s+/g, ''))
          );
          if (matchingThread) {
            setSelectedThread(matchingThread);
          } else {
            const art = artisans.find((a) => a.name === q.artisanName || a.id === q.artisanId) || {
              id: q.artisanId,
              name: q.artisanName,
              trade: q.artisanTrade,
              avatar: q.artisanAvatar,
              phone: q.artisanPhone,
              rating: 4.8,
              reviewsCount: 15,
              verified: true,
              location: q.artisanLocation,
              quartier: user?.quartier || 'Bamako',
              minPrice: q.priceEstimate,
              badge: 'Artisan Proxi',
              specialties: [q.artisanTrade],
            };
            const thr = Storage.getOrCreateArtisanThread(art);
            setThreads(Storage.getThreads());
            setSelectedThread(thr);
          }
        }}
      />

      {/* Payment & Express Order Modal */}
      <PaymentModal
        product={selectedProductForPayment}
        user={user}
        onClose={() => setSelectedProductForPayment(null)}
        onSuccess={handleOrderSuccess}
      />

      {/* Live Order Tracker Modal */}
      {isOrderTrackOpen && (
        <OrderTrackModal
          order={ACTIVE_ORDER}
          onClose={() => setIsOrderTrackOpen(false)}
          onOpenChatWithCourier={() => {
            setIsOrderTrackOpen(false);
            const courierThread = threads[0];
            setSelectedThread(courierThread);
          }}
        />
      )}

      {/* Interactive Chat Modal */}
      <ChatModal
        thread={selectedThread}
        onClose={() => setSelectedThread(null)}
        onThreadsUpdate={handleThreadsUpdate}
        onOpenQuoteDetail={handleOpenQuoteDetailFromThread}
      />

      {/* Frosted Glass Login, 2FA, Reset Password Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          if (isLoggedIn) {
            setIsAuthOpen(false);
          }
        }}
        isLoggedIn={isLoggedIn}
        currentUser={user}
        onUserUpdate={(u) => setUser(u)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsAuthOpen(false);
          showToast('Connexion réussie. Bienvenue sur Proxi Market !');
        }}
      />

      {/* Contextual AI Assistant Chatbot Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onNavigateTab={(t) => setActiveTab(t)}
      />

      {/* Neighborhood Location Picker Modal */}
      <QuartierModal
        isOpen={isQuartierModalOpen}
        onClose={() => setIsQuartierModalOpen(false)}
        activeQuartier={activeQuartier}
        onSelect={(q) => {
          setActiveQuartier(q);
          const updated = { ...user, quartier: q };
          Storage.saveUser(updated);
          setUser(updated);
          showToast(`Zone définie sur ${q}`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
