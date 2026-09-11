import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { Storage } from '../lib/storage';
import { TranslationKey, getTranslation } from '../lib/translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLanguage?: AppLanguage; onLanguageChange?: (lang: AppLanguage) => void }> = ({
  children,
  initialLanguage,
  onLanguageChange,
}) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return initialLanguage || Storage.getLanguage();
  });

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    Storage.saveLanguage(newLang);
    document.documentElement.lang = newLang;
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
