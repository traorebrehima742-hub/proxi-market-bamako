import React, { useState } from 'react';
import { UserProfile, ThemeMode, AppLanguage } from '../types';
import { ACTIVE_ORDER } from '../data/mockData';
import { Storage } from '../lib/storage';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, ShieldCheck, Award, CreditCard, Bike, 
  MapPin, Store, Settings, ChevronRight, LogOut, 
  Smartphone, Bell, Globe, KeyRound, Sparkles, CheckCircle2, Lock, FileText,
  Moon, Sun, Monitor, Download, FolderArchive, HelpCircle, Terminal, FileCode, Check, X
} from 'lucide-react';

interface ProfilViewProps {
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
  onOpenAuth: () => void;
  onOpenOrderTrack: () => void;
  onOpenAssistant: () => void;
  onNavigateTab: (tab: 'accueil' | 'decouvrir' | 'messages' | 'favoris' | 'profil') => void;
  onOpenQuotes?: () => void;
  quotesCount?: number;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  onLogout?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  user,
  onUserUpdate,
  onOpenAuth,
  onOpenOrderTrack,
  onOpenAssistant,
  onNavigateTab,
  onOpenQuotes,
  quotesCount,
  theme,
  onThemeChange,
  onLogout,
  onShowToast,
}) => {
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editQuartier, setEditQuartier] = useState(user.quartier);
  const [editEmail, setEditEmail] = useState(user.email);
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('bazin');
  const [storeSubmitted, setStoreSubmitted] = useState(false);
  const [showExportGuideModal, setShowExportGuideModal] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const { language, setLanguage, t } = useLanguage();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      quartier: editQuartier,
      email: editEmail.trim() || user.email,
    };
    Storage.saveUser(updated);
    onUserUpdate(updated);
    setShowEditProfileModal(false);
    if (onShowToast) {
      onShowToast('Vos coordonnées ont été mises à jour.');
    }
  };

  const currentTheme: ThemeMode = theme || Storage.getTheme();

  const handleThemeSelect = (newTheme: ThemeMode) => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      Storage.saveTheme(newTheme);
      const updated = { ...user, theme: newTheme };
      Storage.saveUser(updated);
      onUserUpdate(updated);
    }
  };

  const toggleBiometrics = () => {
    const updated = { ...user, biometricsEnabled: !user.biometricsEnabled };
    Storage.saveUser(updated);
    onUserUpdate(updated);
  };

  const toggleNotifications = () => {
    const updated = { ...user, notificationsEnabled: !user.notificationsEnabled };
    Storage.saveUser(updated);
    onUserUpdate(updated);
  };

  const handleLanguageSelect = (newLang: AppLanguage) => {
    setLanguage(newLang);
    const updated = { ...user, language: newLang };
    Storage.saveUser(updated);
    onUserUpdate(updated);
    if (onShowToast) {
      onShowToast(newLang === 'fr' ? '🇫🇷 Langue modifiée : Français' : '🇬🇧 Language switched: English');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    Storage.setToken(null);
    if (onLogout) {
      onLogout();
    } else {
      onOpenAuth();
    }
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSubmitted(true);
    setTimeout(() => {
      setShowSellerModal(false);
      setStoreSubmitted(false);
      if (onShowToast) {
        onShowToast('Votre demande d’ouverture de boutique a été enregistrée. Un agent Proxi Market de votre quartier vous contactera sous 24h.');
      }
    }, 1000);
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-4 space-y-4">
      {/* User Header Profile Card */}
      <div className="clay-card rounded-3xl bg-white p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-100 shadow-sm"
            />
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00685f] text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{user.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                Vérifié
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{user.phone}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <MapPin className="w-3 h-3 text-[#fea619] shrink-0" />
              <span>{user.quartier}, {user.commune}</span>
            </div>
          </div>

          <button
            id="btn-open-edit-profile"
            type="button"
            onClick={() => {
              setEditName(user.name);
              setEditPhone(user.phone);
              setEditQuartier(user.quartier);
              setEditEmail(user.email);
              setShowEditProfileModal(true);
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Modifier mes coordonnées"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Club Proxi Points Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#855300] flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-[#fea619]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Club Proxi Market</span>
                <span className="text-[10px] font-semibold text-[#855300] bg-amber-50 px-1.5 py-0.2 rounded">
                  {user.loyaltyTier}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                <strong className="text-[#00685f]">{user.points} points</strong> accumulés sur vos achats
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Delivery Tracker Card */}
      <div className="clay-card rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 sm:p-5 relative overflow-hidden shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#89f5e7]">
                Livraison en cours (~{ACTIVE_ORDER.etaMinutes} min)
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-1 leading-snug">
              {ACTIVE_ORDER.itemTitle}
            </h3>
            <p className="text-xs text-teal-100/90 mt-0.5">
              {ACTIVE_ORDER.vehicle} • {ACTIVE_ORDER.courierName}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Bike className="w-6 h-6 text-[#fea619]" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-teal-200">Destination : {ACTIVE_ORDER.destinationAddress}</span>
          <button
            onClick={onOpenOrderTrack}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#00685f] text-xs font-bold shadow-md hover:bg-teal-50 active:scale-95 transition-all"
          >
            Suivre sur la carte
          </button>
        </div>
      </div>

      {/* Mes Devis Artisans Section */}
      <div className="clay-card rounded-3xl bg-white p-4 sm:p-5 border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#855300] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mes Devis & Estimations</h3>
              <p className="text-xs text-slate-500">
                {quotesCount ? `${quotesCount} devis artisan${quotesCount > 1 ? 's' : ''} enregistré${quotesCount > 1 ? 's' : ''}` : 'Consultez et validez vos estimations'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQuotes ? onOpenQuotes : () => onNavigateTab('messages')}
            className="px-3.5 py-2 rounded-xl bg-[#855300] hover:bg-[#6c4300] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
          >
            <span>Consulter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accepted Mobile Payments (Orange Money & Wave Mali) */}
      <div className="clay-card rounded-3xl bg-white p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-[#00685f]" />
          <span>Moyens de paiement acceptés</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-orange-50/80 border border-orange-200/80">
            <span className="block text-xs font-black text-orange-600">Orange Money</span>
            <span className="text-[10px] text-orange-700 font-semibold">Actif • Mali (+223)</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/80">
            <span className="block text-xs font-black text-sky-600">Wave Mali</span>
            <span className="text-[10px] text-sky-700 font-semibold">0% de frais</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
            <span className="block text-xs font-black text-emerald-600">Espèces (FCFA)</span>
            <span className="text-[10px] text-emerald-700 font-semibold">À la livraison</span>
          </div>
        </div>
      </div>

      {/* Seller Portal Banner: Ouvrir ma boutique */}
      <div className="clay-card rounded-3xl bg-gradient-to-r from-amber-500 to-[#855300] text-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Espace Vendeur & Artisan</span>
            </div>
            <h3 className="text-base font-bold leading-tight mt-0.5">
              Vendez vos produits à vos voisins de Bamako
            </h3>
            <p className="text-xs text-amber-100 mt-1 max-w-sm">
              Référencez votre boutique ou atelier sur Proxi Market sans frais d’inscription.
            </p>
          </div>

          <button
            onClick={() => setShowSellerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-[#855300] text-xs font-bold shadow-md hover:bg-amber-50 active:scale-95 transition-all shrink-0"
          >
            Ouvrir ma boutique
          </button>
        </div>
      </div>

      {/* Code Source Complet & Export Projet (.ZIP) */}
      <div className="clay-card rounded-3xl bg-white dark:bg-[#121e30] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-[#00685f] dark:text-teal-400 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Code Source Complet (.ZIP)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Prêt pour Production
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Téléchargez l'intégralité des fichiers du projet (composants, configuration, assets, documentation) dans une archive ZIP prête à l'emploi.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <FolderArchive className="w-4 h-4 text-[#00685f]" />
            <span>Contenu de l'archive téléchargée :</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Dossier <code>src/</code> (Vues, Composants, Types)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Dossier <code>public/</code> (PWA, Assets, Manifest)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span><code>package.json</code> &amp; <code>vite.config.ts</code></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Guide d'installation <code>README.md</code></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="/proxi-market-sources.zip"
            download="proxi-market-sources.zip"
            className="flex-1 py-3 px-4 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-center"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger les sources (.ZIP)</span>
          </a>
          <button
            type="button"
            onClick={() => setShowExportGuideModal(true)}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-center"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guide Déploiement &amp; Quitter Démo</span>
          </button>
        </div>
      </div>

      {/* Mode Nuit & Confort Visuel Glassmorphism Selector */}
      <div className="clay-card rounded-3xl bg-white/90 dark:bg-[#121e30]/80 p-4 sm:p-5 border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-[#00685f] dark:text-teal-400 flex items-center justify-center font-bold shadow-xs">
              {currentTheme === 'dark' ? (
                <Moon className="w-5 h-5 text-teal-400" />
              ) : currentTheme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Monitor className="w-5 h-5 text-[#00685f]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confort Visuel & Mode Nuit
                </h3>
                {currentTheme === 'dark' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Nuit de Bamako
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Améliore le confort de lecture le soir et économise la batterie de votre téléphone
              </p>
            </div>
          </div>
        </div>

        {/* 3-Way Segmented Glassmorphism Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleThemeSelect('light')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              currentTheme === 'light'
                ? 'bg-white text-[#00685f] shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:text-teal-300'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sun className={`w-4 h-4 ${currentTheme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>Jour</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Clair</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeSelect('dark')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              currentTheme === 'dark'
                ? 'bg-[#00685f] text-white shadow-md shadow-teal-900/40 ring-1 ring-teal-400/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Moon className={`w-4 h-4 ${currentTheme === 'dark' ? 'text-teal-200' : 'text-slate-400'}`} />
              <span>Nuit</span>
            </div>
            <span className={`text-[10px] font-medium ${currentTheme === 'dark' ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
              Sombre
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeSelect('system')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              currentTheme === 'system'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Monitor className={`w-4 h-4 ${currentTheme === 'system' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Système</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Auto</span>
          </button>
        </div>
      </div>

      {/* Preferences & Security settings */}
      <div className="clay-card rounded-3xl bg-white p-4 divide-y divide-slate-100 space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-[#00685f]" />
          <span>Sécurité & Préférences (Chiffrement AES-256)</span>
        </h3>

        {/* Night Mode Toggle Switch in preferences list */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Basculer en Mode Nuit</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentTheme === 'dark' ? 'Actif • Teinte sombre reposante' : currentTheme === 'light' ? 'Désactivé • Thème clair' : 'Automatique selon votre téléphone'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleThemeSelect(currentTheme === 'dark' ? 'light' : 'dark')}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              currentTheme === 'dark' ? 'bg-[#00685f]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Basculer le mode nuit"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                currentTheme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2FA Status (Obligatoire) */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00685f] dark:text-teal-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Double Authentification (2FA)</h4>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Obligatoire
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sécurisation SMS systématique de votre compte et de vos commandes</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Toujours actif</span>
          </div>
        </div>

        {/* Biometrics Toggle */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Empreinte & Face ID</h4>
              <p className="text-[11px] text-slate-500">Connexion rapide sans retaper votre mot de passe</p>
            </div>
          </div>
          <button
            onClick={toggleBiometrics}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              user.biometricsEnabled ? 'bg-[#00685f]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                user.biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Language switcher */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('settings.language')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-white/10 gap-1">
            <button
              onClick={() => handleLanguageSelect('fr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'fr'
                  ? 'bg-white dark:bg-teal-900/60 text-[#00685f] dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Français (FR)
            </button>
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-teal-900/60 text-[#00685f] dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* AI Assistant Help Center */}
        <div
          onClick={onOpenAssistant}
          className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl px-1 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#fea619] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Assistant Proxi IA & Support</h4>
              <p className="text-[11px] text-slate-500">Questions fréquentes, tarifs et coursiers</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Logout button */}
        <div className="pt-3">
          <button
            id="btn-logout"
            type="button"
            onClick={handleLogoutClick}
            className="w-full py-3 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-red-200/80 dark:border-red-900/40 active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Seller registration modal */}
      {showSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121e30] p-6 shadow-2xl relative border border-slate-200/80 dark:border-white/10">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Ouvrir ma boutique sur Proxi Market</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rejoignez le réseau des commerçants de Bamako.</p>

            <form onSubmit={handleCreateStore} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom du commerce</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Atelier Mandé Couture"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Secteur d'activité</label>
                <select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                >
                  <option value="bazin">Tissus, Bazin & Mode</option>
                  <option value="alimentation">Alimentation & Fruits frais</option>
                  <option value="moto">Mécanique & Pièces moto Djakarta</option>
                  <option value="solaire">Énergie Solaire & Électricité</option>
                  <option value="plomberie">Plomberie & Sanitaire</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSellerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold shadow-xs hover:bg-[#00574f]"
                >
                  Valider ma demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Logout confirmation modal (safe in iframes without window.confirm) */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#121e30] p-6 shadow-2xl relative border border-slate-200/80 dark:border-white/10 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirmer la déconnexion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Voulez-vous vraiment vous déconnecter de votre session Proxi Market ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-logout"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                id="btn-confirm-logout"
                onClick={confirmLogout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xs"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121e30] p-6 shadow-2xl relative border border-slate-200/80 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Modifier mes informations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mettez à jour vos coordonnées personnelles Proxi Market.</p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Téléphone (+223)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Numéro"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quartier Bamako</label>
                  <select
                    value={editQuartier}
                    onChange={(e) => setEditQuartier(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                  >
                    <option value="Hamdallaye ACI 2000">Hamdallaye ACI</option>
                    <option value="Lafiabougou">Lafiabougou</option>
                    <option value="Badalabougou">Badalabougou</option>
                    <option value="Torokorobougou">Torokorobougou</option>
                    <option value="Faladié">Faladié</option>
                    <option value="Quartier du Fleuve">Quartier du Fleuve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adresse email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-[#00685f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold shadow-xs hover:bg-[#00574f] active:scale-95 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Export & Production Setup Modal */}
      {showExportGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#121e30] p-5 sm:p-6 shadow-2xl relative border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#00685f] dark:text-teal-400 flex items-center justify-center font-bold">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Sources Complètes &amp; Sortie du Mode Démo
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Guide pour exporter et lancer l'application en production
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Téléchargement immédiat */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00685f] dark:text-teal-300 uppercase tracking-wide">
                  Option 1 : Téléchargement Direct en 1 Clic
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/60 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                  Archive .ZIP
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Vous n'avez pas besoin de chercher dans les menus d'AI Studio : l'archive complète avec tous les fichiers sources est générée et prête au téléchargement :
              </p>
              <a
                href="/proxi-market-sources.zip"
                download="proxi-market-sources.zip"
                className="w-full py-2.5 px-4 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-center cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le dossier complet (.ZIP)</span>
              </a>
            </div>

            {/* Localiser dans Google AI Studio */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#fea619]" />
                <span>Option 2 : Menu Google AI Studio</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Si vous souhaitez exporter via Google AI Studio :
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Bouton Code (&lt; / &gt;) :</strong> En haut à droite ou dans la barre latérale, ouvrez l'éditeur de code.
                </li>
                <li>
                  <strong>Menu Options (⋮ ou Paramètres) :</strong> Si l'écran est petit ou sur mobile, cliquez sur les 3 points verticaux pour dérouler « Export to GitHub » ou « Download ZIP ».
                </li>
                <li>
                  <strong>Déploiement direct :</strong> Le bouton bleu <strong>« Deploy »</strong> en haut à droite permet aussi de déployer sans rien télécharger directement sur Google Cloud Run.
                </li>
              </ul>
            </div>

            {/* Quitter le mode démo */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-2">
              <span className="text-xs font-bold text-[#855300] dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Comment quitter le mode démo ?</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Le mode démo permettait de tester la double authentification (code fixe <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-bold">123456</code>) et les paiements sans débit réel.
              </p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>Pour passer en production réelle sur votre serveur :</p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                  <li>Décompressez l'archive ZIP dans votre dossier de travail.</li>
                  <li>Dupliquez <code>.env.example</code> vers <code>.env</code> et insérez vos vraies clés (Passerelle SMS Orange/Moov/Malitel, API Wave).</li>
                  <li>Lancez la compilation de production avec <code>npm run build</code>.</li>
                </ol>
              </div>
            </div>

            {/* Commandes rapides de lancement */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  <span>Commandes de démarrage local</span>
                </span>
                {copiedCommand && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copié !
                  </span>
                )}
              </div>
              <div
                onClick={() => {
                  navigator.clipboard?.writeText('npm install && npm run dev');
                  setCopiedCommand('dev');
                  setTimeout(() => setCopiedCommand(null), 2000);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                title="Cliquer pour copier"
              >
                <code>npm install &amp;&amp; npm run dev</code>
                <span className="text-[10px] text-slate-400 font-sans">Copier</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
