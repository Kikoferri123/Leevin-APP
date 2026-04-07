import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import pt from './pt';
import en from './en';

type Lang = 'pt' | 'en';
type Translations = typeof pt;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof Translations) => string;
}

const translations: Record<Lang, Translations> = { pt, en };

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt',
  setLang: () => {},
  t: (key) => key as string,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('leevin_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('leevin_lang', l);
  }, []);

  const t = useCallback((key: keyof Translations): string => {
    return translations[lang][key] || key as string;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
