import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'EN', flag: '🇺🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'PT', flag: '🇧🇷' },
  { code: 'th', name: 'Thai', nativeName: 'TH', flag: '🇹🇭' },
  { code: 'es', name: 'Spanish', nativeName: 'ES', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'DE', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: 'CN', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'AR', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'HI', flag: '🇮🇳' },
];

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Update document direction for RTL languages
    if (languageCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = languageCode;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="mr-1 text-lg">{currentLanguage.flag}</span>
        <span className="font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1 max-h-64 overflow-y-auto">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                    currentLanguage.code === language.code
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-900'
                  }`}
                  dir={language.code === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">{language.flag}</span>
                      <span className="font-medium">{language.nativeName}</span>
                    </div>
                    {currentLanguage.code === language.code && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
