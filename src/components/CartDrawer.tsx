import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, QrCode, AlertCircle, Sparkles } from 'lucide-react';
import { MenuItem, MenuVariant, MenuAddon, RestaurantSettings, TableSession } from '../types/index.ts';

export interface CartItem {
  id: string; // unique cart entry id
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: MenuVariant;
  selectedAddons?: MenuAddon[];
  specialInstructions?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartId: string, qty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  tableNumber: string | null;
  onOpenTableSelector: () => void;
  onSubmitOrder: (specialNotes?: string) => Promise<void>;
  settings: RestaurantSettings;
  currentSession: TableSession | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  tableNumber,
  onOpenTableSelector,
  onSubmitOrder,
  settings,
  currentSession,
}) => {
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate pricing breakdown
  const subtotal = items.reduce((sum, item) => {
    const variantPrice = item.selectedVariant?.price || 0;
    const addonsPrice = (item.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
    const unitPrice = item.menuItem.price + variantPrice + addonsPrice;
    return sum + (unitPrice * item.quantity);
  }, 0);

  const tax = Number((subtotal * (settings.taxRatePercent / 100)).toFixed(2));
  const serviceCharge = Number((subtotal * (settings.serviceChargePercent / 100)).toFixed(2));
  const discount = 0;
  const total = Number((subtotal + tax + serviceCharge - discount).toFixed(2));

  const handleConfirmAndOrder = async () => {
    if (!tableNumber) {
      setErrorMsg('Please select or scan your table QR code before sending orders to the kitchen.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your order bag is empty.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmitOrder(orderNotes.trim() || undefined);
      setOrderNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-semibold text-neutral-900 dark:text-neutral-100">
                Your Culinary Bag
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {items.length} {items.length === 1 ? 'course' : 'courses'} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table Banner Check */}
          <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {tableNumber ? `Dine-In Table ${tableNumber}` : 'No Table Selected'}
              </span>
            </div>
            <button
              onClick={onOpenTableSelector}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {tableNumber ? 'Change' : 'Scan Table QR'}
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="font-serif text-lg text-neutral-600 dark:text-neutral-300">
                  Your tasting bag is empty
                </p>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Browse our seasonal crudo, wood-fired cuts, and craft cocktails to begin your dining experience.
                </p>
              </div>
            ) : (
              items.map(item => {
                const variantPrice = item.selectedVariant?.price || 0;
                const addonsPrice = (item.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
                const unitPrice = item.menuItem.price + variantPrice + addonsPrice;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex gap-3.5"
                  >
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-950 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-serif font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {item.menuItem.name}
                        </h4>
                        <span className="text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
                          {settings.currencySymbol}{itemTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Customization Details */}
                      {item.selectedVariant && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                          {item.selectedVariant.name}
                        </p>
                      )}

                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          + {item.selectedAddons.map(a => a.name).join(', ')}
                        </p>
                      )}

                      {item.specialInstructions && (
                        <p className="text-[11px] italic text-neutral-400 truncate mt-0.5">
                          "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Stepper + Delete */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* General Order Notes */}
            {items.length > 0 && (
              <div className="pt-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                  General Table / Dining Notes
                </label>
                <textarea
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="e.g. Please bring drinks first, extra napkins, celebrate anniversary..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Pricing Breakdown & Submission Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    {settings.currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({settings.taxRatePercent}%)</span>
                  <span className="font-mono">
                    {settings.currencySymbol}{tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge ({settings.serviceChargePercent}%)</span>
                  <span className="font-mono">
                    {settings.currencySymbol}{serviceCharge.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  <span>Round Total</span>
                  <span className="font-mono text-base text-amber-600 dark:text-amber-400">
                    {settings.currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleConfirmAndOrder}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm"
              >
                <span>{isSubmitting ? 'Transmitting to Kitchen...' : `Confirm & Send to Kitchen`}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Courses are fired immediately upon submission. Settle bill when finished.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
