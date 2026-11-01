import React from 'react';
import { ShoppingBag, Sun, Moon, QrCode, Shield } from 'lucide-react';
import { TableSession } from '../types/index.ts';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSimulator: () => void;
  onOpenStaff: () => void;
  onOpenAuth: () => void;
  onOpenReservation: () => void;
  onOpenServiceBell: () => void;
  authUser: any | null;
  currentSession: TableSession | null;
  activeTableNumber: string | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenSimulator,
  onOpenStaff,
  onOpenAuth,
  onOpenReservation,
  onOpenServiceBell,
  authUser,
  activeTableNumber,
  isDark,
  onToggleTheme,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/85 dark:bg-neutral-950/85 bg-white/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        
        {/* Zone 1: Single-element brand wordmark */}
        <button
          onClick={() => onNavigate('hero')}
          className="text-2xl font-serif tracking-wider font-semibold text-neutral-900 dark:text-amber-100 hover:text-amber-600 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          L'AURA
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onNavigate('story')}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            Culinary Story
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            Digital Menu
          </button>
          <button
            onClick={onOpenReservation}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            Reserve Table
          </button>
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>Table QR Simulator</span>
          </button>
          <button
            onClick={() => onNavigate('reviews')}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            Diner Reviews
          </button>
          <button
            onClick={authUser ? onOpenStaff : onOpenAuth}
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            <Shield className="w-4 h-4" />
            <span>{authUser ? `${authUser.name.split(' ')[0]} (${authUser.role})` : 'Staff Admin Auth'}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Light/Dark Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Tableside Service Bell Button */}
          {activeTableNumber && (
            <button
              onClick={onOpenServiceBell}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors"
              title="Summon Waiter"
            >
              <span>🔔 Call Waiter</span>
            </button>
          )}

          {/* Table active status marker if dining */}
          {activeTableNumber && (
            <button
              onClick={onOpenSimulator}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Table {activeTableNumber}</span>
            </button>
          )}

          {/* Primary Action Button: Cart Drawer */}
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-neutral-950 bg-amber-400 hover:bg-amber-300 dark:text-neutral-950 dark:bg-amber-400 dark:hover:bg-amber-300 shadow-sm transition-colors whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Order Bag</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-neutral-950 text-amber-300 text-xs font-mono font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
