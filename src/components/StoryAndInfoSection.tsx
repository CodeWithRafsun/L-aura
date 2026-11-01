import React from 'react';
import { Clock, MapPin, Phone, Mail, Award, CheckCircle2, Star, UtensilsCrossed, Sparkles } from 'lucide-react';
import { CustomerReview, RestaurantSettings } from '../types/index.ts';

interface StoryAndInfoSectionProps {
  settings: RestaurantSettings;
  reviews: CustomerReview[];
  onOpenReviewModal: () => void;
  currencySymbol: string;
}

export const StoryAndInfoSection: React.FC<StoryAndInfoSectionProps> = ({
  settings,
  reviews,
  onOpenReviewModal,
}) => {
  return (
    <div className="space-y-24 py-16 sm:py-24">
      
      {/* 1. Culinary Story Section */}
      <section id="story-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-amber-600 dark:text-amber-400">
              <span>Philosophy & Provenance</span>
              <span aria-hidden="true">·</span>
              <span>Our Culinary Heritage</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 dark:text-neutral-100 font-normal leading-tight">
              An Ode to Fire, Seasonal Earth & Deep Coastal Waters.
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
              Under the creative direction of Executive Chef Laurent Rousseau, {settings.name} marries classical French discipline with Nordic minimalism. Every cut of A5 wagyu is kissed by white oak charcoal; each strand of squid ink pasta is extruded by hand at dawn; and our cellar houses biodynamic vintages selected to elevate every nuance.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">100%</span>
                <p className="text-xs text-neutral-500 mt-1">Single-origin wood-fire hearth</p>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">Zero-Wait</span>
                <p className="text-xs text-neutral-500 mt-1">Direct encrypted table QR ordering</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-900 shadow-lg">
                <img
                  src="/src/assets/images/food_signature_wagyu_1793555392859.jpg"
                  alt="Wood-Fired Wagyu"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-neutral-100 block mb-1">Miyazaki A5 Wagyu</strong>
                Truffle potato silk with 36-hour bone reduction.
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-900 shadow-lg">
                <img
                  src="/src/assets/images/food_artisan_pasta_1793555393056.jpg"
                  alt="Squid Ink Pasta with Lobster"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-neutral-100 block mb-1">Maine Lobster Tagliolini</strong>
                Iranian saffron emulsion and bronze basil.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Restaurant Information, Weekly Schedule & Facilities */}
      <section className="bg-neutral-100/60 dark:bg-neutral-900/40 py-16 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Contact & Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100">
                Location & Reservations
              </h3>
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{settings.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2">
                  Cuisine Specializations
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {settings.cuisineTypes.map(c => (
                    <span key={c} className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Weekly Dining Hours</span>
              </h3>
              <div className="space-y-2 text-xs divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                {settings.weeklySchedule.map(sched => (
                  <div key={sched.day} className="flex justify-between pt-2 first:pt-0">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{sched.day}</span>
                    <span className={sched.isOpen ? 'text-neutral-600 dark:text-neutral-400 font-mono' : 'text-rose-500 italic'}>
                      {sched.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Facilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100">
                Guest Facilities & Standards
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                {settings.facilities.map(fac => (
                  <div key={fac} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 mt-4">
                <strong>QR Code Guest Ordering Active:</strong> Walk in, take your table, and scan the physical wooden stand to order instantly without waiting.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Verified Customer Reviews & Ratings */}
      <section id="reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2">
              <span>Gastronomic Accolades</span>
              <span aria-hidden="true">·</span>
              <span>Verified Dining Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100 font-normal">
              Impressions from the Table
            </h2>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 dark:text-neutral-950" />
            <span>Submit Table Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {review.isVerifiedDiner && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Verified Table Session
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {review.customerName}
                  </h4>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {review.tableNumber && (
                  <span className="text-[10px] font-mono font-medium text-neutral-500">
                    Table {review.tableNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Luxury Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 pt-12 pb-16 bg-neutral-900/50 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-lg font-serif tracking-wider font-semibold text-neutral-100 block">
              {settings.name}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">
              {settings.tagline} · {settings.address}
            </p>
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <span>© 2026 {settings.name}</span>
            <span>·</span>
            <span>All rights reserved</span>
            <span>·</span>
            <span>Digital Dining Protocol v2.4</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
