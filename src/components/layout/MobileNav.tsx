'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, PieChart, User } from 'lucide-react';

interface MobileNavProps {
  onCreateExpense?: () => void;
}

export default function MobileNav({ onCreateExpense }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/groups', icon: Users, label: 'Groups' },
    { href: '/analytics', icon: PieChart, label: 'Analytics' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary-elevated/95 backdrop-blur-lg border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
              ${isActive(item.href)
                ? 'text-accent-emerald'
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Center FAB */}
        {onCreateExpense && (
          <button
            onClick={onCreateExpense}
            className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-accent-emerald shadow-lg shadow-accent-emerald/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}

        {navItems.slice(2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
              ${isActive(item.href)
                ? 'text-accent-emerald'
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
