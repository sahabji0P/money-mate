'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  PieChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onCreateGroup?: () => void;
}

export default function Sidebar({ user, onCreateGroup }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/groups', icon: Users, label: 'Groups' },
    { href: '/analytics', icon: PieChart, label: 'Analytics' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-screen bg-primary-elevated border-r border-border-subtle
        transition-all duration-300 ease-smooth sticky top-0
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-emerald-dark flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-text">MoneyMate</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-primary-hover transition-colors text-text-secondary hover:text-text"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Create Group Button */}
      {onCreateGroup && (
        <div className="px-4 mb-4">
          <button
            onClick={onCreateGroup}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl
              bg-accent-emerald hover:bg-accent-emerald-dark text-white font-medium
              transition-all duration-200 hover:shadow-glow-emerald
              ${collapsed ? 'px-3' : 'px-4'}
            `}
          >
            <Plus className="w-5 h-5" />
            {!collapsed && <span>Create Group</span>}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-accent-emerald/10 text-accent-emerald'
                    : 'text-text-secondary hover:bg-primary-hover hover:text-text'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border-subtle">
        {user && (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-emerald/20 flex items-center justify-center text-accent-emerald font-medium flex-shrink-0">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => signOut()}
          className={`
            mt-3 w-full flex items-center gap-2 px-4 py-2.5 rounded-lg
            text-text-secondary hover:bg-primary-hover hover:text-text
            transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
