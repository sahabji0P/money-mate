'use client';

import Link from 'next/link';
import { Bell, Search, Menu, Wallet } from 'lucide-react';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ user, title, showSearch = false, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-primary/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-hover transition-colors text-text-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo for mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-emerald to-accent-emerald-dark flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-text">MoneyMate</span>
          </Link>

          {/* Page title for desktop */}
          {title && (
            <h1 className="hidden lg:block text-xl font-semibold text-text">
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {showSearch && (
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-elevated border border-border-subtle hover:border-border text-text-tertiary hover:text-text-secondary transition-all">
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-hover text-text-tertiary">
                /
              </kbd>
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-primary-elevated border border-transparent hover:border-border-subtle transition-all text-text-secondary hover:text-text">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-rose rounded-full" />
          </button>

          {/* User avatar */}
          {user && (
            <Link href="/profile" className="flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-9 h-9 rounded-full ring-2 ring-border-subtle hover:ring-accent-emerald transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent-emerald/20 flex items-center justify-center text-accent-emerald font-medium text-sm ring-2 ring-border-subtle hover:ring-accent-emerald transition-all">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
