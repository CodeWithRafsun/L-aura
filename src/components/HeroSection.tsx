import React from 'react';
import { ArrowRight, QrCode, Sparkles, Clock, MapPin, Award } from 'lucide-react';
import { RestaurantSettings } from '../types/index.ts';

interface HeroSectionProps {
  settings: RestaurantSettings;
  onExploreMenu: () => void;
  onOpenSimulator: () => void;
  onOpenReservation: () => void;
  activeTableNumber: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExploreMenu,
  onOpenSimulator,
  onOpenReservation,
  activeTableNumber,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-amber-600 dark:text-amber-400">
              <span>Michelin Recommended 2026</span>
              <span aria-hidden="true">·</span>
              <span>San Francisco Upper Terrace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.12] text-balance">
              Where Precision Wood-Fire Meets Coastal Elegance.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
              Welcome to {settings.name}. Experience seamless tableside dining: explore our seasonal tasting menu, order course-by-course directly from your table QR code, tip your dedicated sommelier, and settle your bill on your own terms.
            </p>

            {/* Active Table Notification if diner has a table */}
            {activeTableNumber && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
                    {activeTableNumber}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Active Dining Session: Table {activeTableNumber}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Orders and refills will be sent directly to your table runner.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSimulator}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline shrink-0"
                >
                  Change Table
                </button>
              </div>
            )}

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreMenu}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 shadow-md transition-colors font-bold"
              >
                <span>Browse Tasting Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenReservation}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors"
              >
                <span>Reserve a Table</span>
              </button>

              <button
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <QrCode className="w-4 h-4 text-amber-500" />
                <span>Simulate Table QR</span>
              </button>
            </div>

            {/* Key info badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500/80" />
                <span>Open Today: 5:00 PM – 11:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500/80" />
                <span>Upper Terrace, California</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fidelity Hero Photography */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 aspect-[16/10] bg-neutral-900">
              <img
                src="/src/assets/images/hero_dining_interior_1793555391854.jpg"
                alt="L'Aura Modern Dining Room and Wine Cellar"
                className="w-full h-full object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent pointer-events-none" />
              
              {/* Overlay card for culinary craft */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-neutral-950/75 backdrop-blur-md border border-neutral-800 text-neutral-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-medium">Tonight's Chef Curations</p>
                  <p className="text-sm font-serif font-medium text-white">Miyazaki A5 Wagyu & Maine Lobster Squid Ink Tagliolini</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Chef de Cuisine</span>
                  <span className="text-xs font-medium text-amber-200">Laurent Rousseau</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Feature Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <QrCode className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Table QR Ordering</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Unique encrypted table codes. Order rounds at your own pace without waving down staff.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Live Kitchen Display</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Orders beam straight to the KDS kitchen brigade with real-time status progression.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <Award className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Direct Waiter Tipping</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Recognize and reward your dedicated sommelier and captain with 100% transparent gratuity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80">
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Zero-Wait Digital Pay</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Split or settle with QR payments, mobile wallet, card, or cash with instant cashier verification.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
