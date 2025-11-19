'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus } from 'lucide-react';

interface MobileNavProps {
  onCreateExpense?: () => void;
}

export default function MobileNav({ onCreateExpense }: MobileNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary-elevated/95 backdrop-blur-lg border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-center px-4 py-3">
        <Link
          href="/"
          className={`
            flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all
            ${isHome
              ? 'text-accent-emerald'
              : 'text-text-tertiary hover:text-text-secondary'
            }
          `}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>

        {/* Center FAB */}
        {onCreateExpense && (
          <button
            onClick={onCreateExpense}
            className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center justify-center w-14 h-14 rounded-full bg-accent-emerald shadow-lg shadow-accent-emerald/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </nav>
  );
}
