import React, { useState } from 'react';
import { X, Clock, Star, AlertTriangle, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, MenuVariant, MenuAddon, RestaurantSettings } from '../types/index.ts';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customization: {
    selectedVariant?: MenuVariant;
    selectedAddons?: MenuAddon[];
    specialInstructions?: string;
  }) => void;
  currencySymbol: string;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
  currencySymbol,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | undefined>(
    item.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const toggleAddon = (addon: MenuAddon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Calculate dynamic price based on variant and addons
  const basePrice = item.price + (selectedVariant?.price || 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const itemUnitPrice = basePrice + addonsTotal;
  const totalPrice = itemUnitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, {
      selectedVariant,
      selectedAddons,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-950/60 text-white hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Dish Image */}
          <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                  {item.dietary.join(' · ')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium leading-tight">
                  {item.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-semibold text-white">
                  {currencySymbol}{item.price.toFixed(2)}
                </span>
                {item.originalPrice && (
                  <span className="block text-xs line-through text-neutral-400 font-mono">
                    {currencySymbol}{item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{item.rating.toFixed(1)}</span>
                <span className="text-neutral-400">({item.reviewsCount} reviews)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{item.preparationMinutes} mins prep</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className={item.isAvailable && !item.isSoldOut ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-500"}>
                {item.isSoldOut ? "Sold Out" : item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Culinary Description
              </h4>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Ingredients & Allergens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Key Ingredients
                </p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                  {item.ingredients.join(', ') || 'Seasonal pantry selection'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Allergen Notice</span>
                </p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                  {item.allergens.length > 0 ? item.allergens.join(', ') : 'None listed (inform your waiter)'}
                </p>
              </div>
            </div>

            {/* Variants (e.g. Doneness) */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Selection / Doneness
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-200'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                        }`}
                      >
                        <span>{variant.name}</span>
                        {variant.price > 0 && (
                          <span className="font-mono text-neutral-500">+{currencySymbol}{variant.price.toFixed(2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Chef Enhancements & Add-ons
                </label>
                <div className="space-y-2">
                  {item.addons.map(addon => {
                    const isChecked = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium border transition-colors ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-200'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-neutral-400'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono text-neutral-500">
                          +{currencySymbol}{addon.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Special Kitchen Instructions (Optional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Cut for sharing, extra cracked pepper, severe nut allergy..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80 flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 p-1 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-mono font-semibold text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            disabled={item.isSoldOut || !item.isAvailable}
            className="flex-1 inline-flex items-center justify-between px-6 py-3 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm"
          >
            <span>{item.isSoldOut ? 'Currently Sold Out' : 'Add to Order Bag'}</span>
            <span className="font-mono font-bold">
              {currencySymbol}{totalPrice.toFixed(2)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
