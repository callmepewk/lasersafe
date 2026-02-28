import React, { useState } from 'react';
import { useTranslation } from './TranslationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelector({ variant = 'default' }) {
  const { currentLanguage, changeLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLang = supportedLanguages.find(l => l.code === currentLanguage);

  const handleLanguageChange = async (langCode) => {
    setIsChanging(true);
    setIsOpen(false);
    await changeLanguage(langCode);
    setTimeout(() => {
      setIsChanging(false);
      window.location.reload();
    }, 300);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className="flex items-center gap-2 min-w-[140px]"
          disabled={isChanging}
        >
          <Globe className="w-4 h-4" />
          <span className="text-xl">{currentLang?.flag}</span>
          <span className="hidden sm:inline text-sm">{currentLang?.code.split('-')[0].toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer py-2.5"
            disabled={isChanging}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{lang.name}</span>
                <span className="text-xs text-slate-500">{lang.code}</span>
              </div>
            </div>
            {currentLanguage === lang.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}