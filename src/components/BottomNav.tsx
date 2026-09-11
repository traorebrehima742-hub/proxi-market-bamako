import React from 'react';
import { Home, Compass, MessageSquare, Heart, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type TabType = 'accueil' | 'decouvrir' | 'messages' | 'favoris' | 'profil';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadMessagesCount?: number;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadMessagesCount = 1,
  favoritesCount = 4,
}) => {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'accueil' as TabType,
      label: t('nav.home'),
      icon: Home,
    },
    {
      id: 'decouvrir' as TabType,
      label: t('nav.discover'),
      icon: Compass,
    },
    {
      id: 'messages' as TabType,
      label: t('nav.messages'),
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'favoris' as TabType,
      label: t('nav.favorites'),
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'profil' as TabType,
      label: t('nav.profile'),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0a111a]/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] pb-safe transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all duration-150 ${
                isActive ? 'text-[#00685f] dark:text-teal-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <div
                className={`relative px-3 py-1 rounded-2xl transition-all ${
                  isActive ? 'bg-teal-50 dark:bg-teal-950/70 shadow-2xs' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.8px]'}`} />

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-black rounded-full bg-[#fea619] text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] tracking-tight mt-0.5 ${
                  isActive ? 'font-bold text-[#00685f] dark:text-teal-300' : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00685f] dark:bg-teal-300" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
