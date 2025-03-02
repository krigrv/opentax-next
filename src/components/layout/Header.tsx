'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">{t('appName')}</span>
            </Link>
            <span className="ml-2 text-sm text-muted-foreground hidden md:inline-block">
              {t('tagline')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('dashboard')}
            </Link>
            <Link href="/calculator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('calculator')}
            </Link>
            <Link href="/documents" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('documents')}
            </Link>
            <Link href="/updates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('updates')}
            </Link>
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{i18n.language === 'hi' ? 'हिंदी' : 'English'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                  हिंदी (Hindi)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span>{t('account')}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('yourAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default" size="sm">
              {t('donate')}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] py-4">
          <div className="container space-y-4">
            <Link href="/dashboard" className="block py-2 text-sm font-medium text-foreground">
              {t('dashboard')}
            </Link>
            <Link href="/calculator" className="block py-2 text-sm font-medium text-foreground">
              {t('calculator')}
            </Link>
            <Link href="/documents" className="block py-2 text-sm font-medium text-foreground">
              {t('documents')}
            </Link>
            <Link href="/updates" className="block py-2 text-sm font-medium text-foreground">
              {t('updates')}
            </Link>
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <div className="flex items-center py-2">
                <Globe className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{t('selectLanguage')}</span>
              </div>
              <button onClick={() => changeLanguage('en')} className="block w-full text-left py-2 px-4 text-sm">
                English
              </button>
              <button onClick={() => changeLanguage('hi')} className="block w-full text-left py-2 px-4 text-sm">
                हिंदी (Hindi)
              </button>
            </div>
            <div className="pt-4">
              <Button className="w-full">{t('donate')}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
