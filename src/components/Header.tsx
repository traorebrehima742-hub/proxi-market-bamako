import React from 'react';
import { UserProfile } from '../types';
import { PWAInstallBanner } from './PWAInstallBanner';
import { Bell, User, MapPin, ChevronDown, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  user: UserProfile;
  isLoggedIn?: boolean;
  onOpenProfile: () => void;
  onOpenAssistant: () => void;
  activeQuartier: string;
  onSelectQuartier: () => void;
  unreadNotifications?: number;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggedIn = true,
  onOpenProfile,
  onOpenAssistant,
  activeQuartier,
  onSelectQuartier,
  unreadNotifications = 1,
  onNotificationClick,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#f8f9ff]/85 dark:bg-[#0a111a]/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] pt-safe transition-colors">
      <div className="h-16 px-4 max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Identity & Location */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[60%]">
          {/* Logo SVG Icon */}
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-slate-800 flex items-center justify-center">
            <img 
              src="/icon.svg" 
              alt="Proxi Market Logo" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                // fallback if svg fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-lg text-[#00685f] dark:text-teal-400 tracking-tight truncate font-['Inter']">
                Proxi <span className="text-[#855300] dark:text-[#fea619]">Market</span>
              </span>
            </div>

            {/* Neighborhood Location Dropdown Selector */}
            <button
              onClick={onSelectQuartier}
              className="flex items-center gap-1 text-left min-h-[20px] -ml-0.5 mt-0.5 group"
              aria-label={t('header.selectDistrict')}
            >
              <MapPin className="w-3.5 h-3.5 text-[#fea619] shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold group-hover:text-[#00685f] dark:group-hover:text-teal-300 transition-colors truncate">
                Bamako • {activeQuartier}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Switcher Pill */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60 dark:border-white/10 active:scale-95 shadow-2xs cursor-pointer"
            title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
            aria-label="Changer de langue / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-[#00685f] dark:text-teal-400" />
            <span className="text-[11px] font-extrabold uppercase">{language}</span>
          </button>

          {/* Compact PWA Install button */}
          <PWAInstallBanner compact />

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            title={t('header.aiAssistant')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-50 dark:hover:bg-teal-950/60 text-[#00685f] dark:text-teal-400 relative active:scale-95 transition-all"
            aria-label={t('header.aiAssistant')}
          >
            <Sparkles className="w-4.5 h-4.5 text-[#fea619]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onNotificationClick ? onNotificationClick : () => {}}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative active:scale-95 transition-all"
            aria-label={t('header.notifications')}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fea619] ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          <button
            id="btn-header-profile"
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-[#00685f] text-white flex items-center justify-center ml-0.5 ring-2 ring-white dark:ring-slate-800 shadow-sm active:scale-95 transition-transform overflow-hidden cursor-pointer"
            aria-label={isLoggedIn ? `${t('header.myProfile')} (${user.name})` : t('header.signIn')}
            title={isLoggedIn ? `${t('header.myProfile')} (${user.name})` : t('header.signIn')}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
