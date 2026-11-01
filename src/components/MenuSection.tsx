import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, Clock, Plus, Sparkles } from 'lucide-react';
import { MenuItem, MenuCategory, DietaryTag } from '../types/index.ts';

interface MenuSectionProps {
  categories: MenuCategory[];
  items: MenuItem[];
  currencySymbol: string;
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

const DIETARY_OPTIONS: DietaryTag[] = [
  'Chef Special',
  'Gluten-Free',
  'Vegetarian',
  'Vegan',
  'Halal',
];

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  items,
  currencySymbol,
  onSelectItem,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'prep-time'>('featured');

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.categoryId === selectedCategory);
    }

    // Dietary filter
    if (selectedDietary !== 'all') {
      result = result.filter(item => item.dietary.includes(selectedDietary));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients.some(i => i.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'prep-time') {
      result.sort((a, b) => a.preparationMinutes - b.preparationMinutes);
    } else {
      // Featured / default: featured items first, then popular
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [items, selectedCategory, selectedDietary, searchQuery, sortBy]);

  return (
    <section id="menu-section" className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2">
              <span>Gastronomic Selections</span>
              <span aria-hidden="true">·</span>
              <span>Autumn Tasting Program</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 dark:text-neutral-100 font-normal">
              The Interactive Digital Menu
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
              Each dish reflects seasonal micro-harvests, wild marine catches, and heritage wood-fire cookery. Click any plate to customize doneness, add winter truffles, or specify allergies.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Controls Row 1: Categories Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All Courses ({items.length})
          </button>
          {categories.map(cat => {
            const count = items.filter(i => i.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row 2: Dietary Preferences & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 mb-8 border-y border-neutral-200 dark:border-neutral-800/80">
          {/* Dietary Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Dietary:</span>
            </span>
            <button
              onClick={() => setSelectedDietary('all')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedDietary === 'all'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Any
            </button>
            {DIETARY_OPTIONS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedDietary(selectedDietary === tag ? 'all' : tag)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  selectedDietary === tag
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="featured">Chef's Curated</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="prep-time">Fastest Preparation</option>
            </select>
          </div>
        </div>

        {/* Food Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-base font-serif text-neutral-700 dark:text-neutral-300">
              No dishes match your selected filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDietary('all');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Food Image Container */}
                <div
                  onClick={() => onSelectItem(item)}
                  className="relative aspect-[4/3] w-full bg-neutral-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges without generic pill spam */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {item.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-400 text-neutral-950">
                        Signature
                      </span>
                    )}
                    {item.isSoldOut && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-neutral-900/90 text-rose-300 border border-rose-500/30">
                        Sold Out Tonight
                      </span>
                    )}
                  </div>

                  {/* Prep time & rating on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-200 font-light">
                    <span className="flex items-center gap-1 bg-neutral-950/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.preparationMinutes} min</span>
                    </span>
                    <span className="flex items-center gap-1 bg-neutral-950/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-amber-300 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{item.rating.toFixed(1)}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clean unboxed dietary metadata */}
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mb-1.5">
                      {item.dietary.join(' · ')}
                    </div>

                    <h3
                      onClick={() => onSelectItem(item)}
                      className="text-lg font-serif font-medium text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-300 cursor-pointer transition-colors leading-snug"
                    >
                      {item.name}
                    </h3>

                    <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer: Price & Add button */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {currencySymbol}{item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="ml-2 text-xs line-through text-neutral-400 font-mono">
                          {currencySymbol}{item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => onQuickAdd(item)}
                        disabled={item.isSoldOut || !item.isAvailable}
                        aria-label={`Add ${item.name}`}
                        className="p-2 rounded-lg bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-300 disabled:opacity-40 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
