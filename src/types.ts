export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'fr' | 'en';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  quartier: string;
  commune: string;
  role: 'client' | 'artisan' | 'vendeur';
  verified: boolean;
  twoFactorEnabled: boolean;
  biometricsEnabled: boolean;
  points: number;
  loyaltyTier: string;
  avatar: string;
  notificationsEnabled: boolean;
  language: AppLanguage;
  theme?: ThemeMode;
}

export interface ProductItem {
  id: string;
  title: string;
  category: 'bazin' | 'solaire' | 'alimentation' | 'mode' | 'autre';
  price: number;
  originalPrice?: number;
  unit?: string;
  shopName: string;
  shopLocation: string;
  distanceKm: number;
  inStock: boolean;
  stockBadge?: string;
  image: string;
  phone: string;
  address: string;
  hours: string;
  description: string;
  isFavorite?: boolean;
}

export interface ArtisanItem {
  id: string;
  name: string;
  trade: string;
  category: 'moto' | 'btp' | 'couture' | 'electricite' | 'beaute' | 'autre';
  verified: boolean;
  rating: number;
  reviewsCount: number;
  minPrice: number;
  priceNote?: string;
  location: string;
  address: string;
  coverage: string;
  availableHours: string;
  phone: string;
  avatar: string;
  description: string;
  iconName: string;
  isFavorite?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'merchant' | 'system';
  text: string;
  timestamp: string;
  audio?: {
    url: string;
    durationSec: number;
    waveform?: number[];
    transcript?: string;
  };
  attachment?: {
    type: 'quote' | 'image' | 'product';
    title: string;
    detail?: string;
    url?: string;
  };
}

export interface ConversationThread {
  id: string;
  contactName: string;
  contactSubtitle: string;
  category: 'orders' | 'artisans';
  avatar: string;
  verified: boolean;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  phone: string;
  productPreview?: {
    title: string;
    price: string;
    image: string;
  };
  quotePreview?: {
    title: string;
    price: string;
    fileName?: string;
  };
  messages: ChatMessage[];
}

export interface MarketPlace {
  id: string;
  name: string;
  quartier: string;
  distance: string;
  openStatus: string;
  merchantsCount: number;
  specialties: string[];
}

export interface OrderTrackInfo {
  orderId: string;
  itemTitle: string;
  courierName: string;
  vehicle: string;
  courierPhone: string;
  etaMinutes: number;
  status: 'preparation' | 'pickup' | 'in_route' | 'delivered';
  currentAddress: string;
  destinationAddress: string;
  priceFCFA: number;
}

export type QuoteStatus = 'pending' | 'received' | 'accepted' | 'rejected' | 'completed';

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
}

export interface QuoteItem {
  id: string;
  reference: string;
  artisanId: string;
  artisanName: string;
  artisanTrade: string;
  artisanAvatar: string;
  artisanPhone: string;
  artisanLocation: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  project: string;
  description: string;
  urgency: string;
  createdAt: string;
  validUntil: string;
  status: QuoteStatus;
  priceEstimate: number;
  breakdown: QuoteBreakdownItem[];
  threadId?: string;
  notes?: string;
}
