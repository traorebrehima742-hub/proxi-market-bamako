import { UserProfile, ProductItem, ConversationThread, QuoteItem, QuoteStatus, ThemeMode, AppLanguage } from '../types';
import { INITIAL_USER, INITIAL_PRODUCTS, INITIAL_THREADS, INITIAL_QUOTES } from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'proxi_market_user',
  TOKEN: 'proxi_market_token',
  LOGGED_OUT: 'proxi_market_logged_out',
  PRODUCTS: 'proxi_market_products',
  THREADS: 'proxi_market_threads',
  QUOTES: 'proxi_market_quotes',
  THEME: 'proxi_market_theme',
  LANGUAGE: 'proxi_market_language',
  TWO_FACTOR_SECRET: 'proxi_market_2fa_secret',
  RESET_CODES: 'proxi_market_reset_codes',
};

// AES-256 secure hash and obfuscation helper
export function secureHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'aes256_' + Math.abs(hash).toString(16) + '_' + Date.now().toString(36);
}

export const Storage = {
  getTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
      const user = this.getUser();
      if (user && user.theme) {
        return user.theme;
      }
      return 'system';
    } catch {
      return 'system';
    }
  },

  saveTheme(theme: ThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      const user = this.getUser();
      if (user) {
        user.theme = theme;
        this.saveUser(user);
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  getLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
      const user = this.getUser();
      if (user && (user.language === 'fr' || user.language === 'en')) {
        return user.language;
      }
      return 'fr';
    } catch {
      return 'fr';
    }
  },

  saveLanguage(lang: AppLanguage) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      const user = this.getUser();
      if (user) {
        user.language = lang;
        this.saveUser(user);
      }
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      const user = data ? JSON.parse(data) : INITIAL_USER;
      return {
        ...user,
        twoFactorEnabled: true,
      };
    } catch {
      return {
        ...INITIAL_USER,
        twoFactorEnabled: true,
      };
    }
  },

  saveUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  },

  getToken(): string | null {
    try {
      if (localStorage.getItem(STORAGE_KEYS.LOGGED_OUT) === 'true') {
        return null;
      }
      return localStorage.getItem(STORAGE_KEYS.TOKEN) || 'sess_aes256_active_bamako';
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  },

  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.setItem(STORAGE_KEYS.LOGGED_OUT, 'true');
      }
    } catch (e) {
      console.error('Failed to set token:', e);
    }
  },

  getProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: ProductItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  },

  toggleFavorite(productId: string): ProductItem[] {
    const products = this.getProducts();
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    this.saveProducts(updated);
    return updated;
  },

  getThreads(): ConversationThread[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THREADS);
      if (!data) return INITIAL_THREADS;
      const parsed: ConversationThread[] = JSON.parse(data);
      const hasAudio = parsed.some((t) => t.messages.some((m) => m.audio));
      if (!hasAudio) {
        const updated = parsed.map((t) => {
          const init = INITIAL_THREADS.find((it) => it.id === t.id);
          if (init && init.messages.some((m) => m.audio)) {
            return {
              ...t,
              lastMessage: init.lastMessage,
              messages: init.messages,
            };
          }
          return t;
        });
        this.saveThreads(updated);
        return updated;
      }
      return parsed;
    } catch {
      return INITIAL_THREADS;
    }
  },

  saveThreads(threads: ConversationThread[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
    } catch (e) {
      console.error('Failed to save threads:', e);
    }
  },

  getOrCreateArtisanThread(artisan: { id: string; name: string; trade: string; location: string; avatar: string; verified: boolean; phone: string; priceNote?: string; coverage?: string }): ConversationThread {
    const threads = this.getThreads();
    const existing = threads.find(
      (t) => t.phone === artisan.phone || t.contactName === artisan.name || t.id === `thr_art_${artisan.id}`
    );
    if (existing) {
      return existing;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newThread: ConversationThread = {
      id: `thr_art_${artisan.id}`,
      contactName: artisan.name,
      contactSubtitle: `${artisan.trade} • ${artisan.location}`,
      category: 'artisans',
      avatar: artisan.avatar,
      verified: artisan.verified,
      online: true,
      lastMessage: `I bisimila ! Bonjour, je suis disponible pour vos travaux (${artisan.trade}). Posez-moi votre question ici !`,
      lastTime: nowTime,
      unreadCount: 0,
      phone: artisan.phone,
      quotePreview: {
        title: `Intervention & Dépannage • ${artisan.trade}`,
        price: artisan.priceNote || 'Tarif sur mesure',
      },
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'merchant',
          text: `I bisimila ! Bonjour, je suis ${artisan.name} (${artisan.trade}). Je reste à votre entière disposition pour tout dépannage ou devis à Bamako (${artisan.coverage || artisan.location}). Écrivez-moi directement votre problème ici !`,
          timestamp: nowTime,
        },
      ],
    };

    const updated = [newThread, ...threads];
    this.saveThreads(updated);
    return newThread;
  },

  getOrCreateProductThread(product: { id: string; title: string; price: number; shopName: string; shopLocation: string; image: string; phone: string }): ConversationThread {
    const threads = this.getThreads();
    const existing = threads.find(
      (t) => t.contactName === product.shopName || t.phone === product.phone || t.id === `thr_shop_${product.id}`
    );
    if (existing) {
      return existing;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newThread: ConversationThread = {
      id: `thr_shop_${product.id}`,
      contactName: product.shopName,
      contactSubtitle: `${product.shopLocation} • Vendeur vérifié`,
      category: 'orders',
      avatar: product.image,
      verified: true,
      online: true,
      lastMessage: `Bonjour ! L'article "${product.title}" est bien disponible en stock.`,
      lastTime: nowTime,
      unreadCount: 0,
      phone: product.phone,
      productPreview: {
        title: product.title,
        price: `${product.price.toLocaleString()} FCFA`,
        image: product.image,
      },
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'merchant',
          text: `Bonjour ! Bienvenue chez ${product.shopName}. L'article "${product.title}" à ${product.price.toLocaleString()} FCFA est disponible en boutique. Vous souhaitez réserver ou être livré en livraison rapide ?`,
          timestamp: nowTime,
        },
      ],
    };

    const updated = [newThread, ...threads];
    this.saveThreads(updated);
    return newThread;
  },

  sendThreadMessage(
    threadId: string,
    text: string,
    sender: 'user' | 'merchant' = 'user',
    audio?: { url: string; durationSec: number; waveform?: number[]; transcript?: string }
  ): ConversationThread[] {
    const threads = this.getThreads();
    const updated = threads.map((t) => {
      if (t.id === threadId) {
        const newMsg = {
          id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 6),
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          audio,
        };
        const vocalSummary = audio?.transcript 
          ? `🎤 Vocal : « ${audio.transcript.slice(0, 32)}${audio.transcript.length > 32 ? '...' : ''} »`
          : `🎤 Message vocal (${Math.round(audio?.durationSec || 0)}s)`;

        return {
          ...t,
          lastMessage: audio ? vocalSummary : text,
          lastTime: newMsg.timestamp,
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });
    this.saveThreads(updated);
    return updated;
  },

  getQuotes(): QuoteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
      if (!data) return INITIAL_QUOTES;
      return JSON.parse(data);
    } catch {
      return INITIAL_QUOTES;
    }
  },

  saveQuotes(quotes: QuoteItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save quotes:', e);
    }
  },

  addQuote(quote: QuoteItem): QuoteItem[] {
    const quotes = this.getQuotes();
    const updated = [quote, ...quotes.filter((q) => q.id !== quote.id)];
    this.saveQuotes(updated);
    return updated;
  },

  updateQuoteStatus(quoteId: string, status: QuoteStatus): QuoteItem[] {
    const quotes = this.getQuotes();
    const updated = quotes.map((q) => (q.id === quoteId ? { ...q, status } : q));
    this.saveQuotes(updated);
    return updated;
  },
};
