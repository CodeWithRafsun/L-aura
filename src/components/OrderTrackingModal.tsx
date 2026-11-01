import React from 'react';
import { X, CheckCircle2, Clock, ChefHat, UtensilsCrossed, BellRing, ArrowRight, CreditCard } from 'lucide-react';
import { Order, OrderStatus, RestaurantSettings } from '../types/index.ts';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  tableNumber: string | null;
  settings: RestaurantSettings;
  onOpenPayment: () => void;
  onOrderMore: () => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Preparing',
  'Ready to Serve',
  'Served'
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  tableNumber,
  settings,
  onOpenPayment,
  onOrderMore,
}) => {
  if (!isOpen) return null;

  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalSessionBill = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Table {tableNumber || 'Guest'} Dining Session</span>
            </div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Live Order & Kitchen Timeline
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="font-serif text-lg text-neutral-600 dark:text-neutral-400">
                No orders active for Table {tableNumber}
              </p>
              <button
                onClick={onOrderMore}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            activeOrders.map((order, orderIdx) => {
              const currentStepIdx = STATUS_STEPS.indexOf(order.status);

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-5"
                >
                  {/* Order Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-neutral-400 ml-2">
                        Round #{activeOrders.length - orderIdx} · Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Progression */}
                  <div className="relative py-2">
                    <div className="grid grid-cols-5 gap-1 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div key={step} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors ${
                                isDone
                                  ? 'bg-amber-500 text-neutral-950'
                                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] leading-tight ${
                                isCurrent
                                  ? 'font-bold text-neutral-900 dark:text-neutral-100'
                                  : 'text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress Bar Line */}
                    <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-700 -z-0" />
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Dishes Fired
                    </p>
                    <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                      {order.items.map(item => (
                        <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                              {item.quantity}x {item.name}
                            </span>
                            {item.customization?.selectedVariant && (
                              <span className="text-amber-600 dark:text-amber-400 block text-[11px]">
                                · {item.customization.selectedVariant.name}
                              </span>
                            )}
                            {item.customization?.selectedAddons && item.customization.selectedAddons.length > 0 && (
                              <span className="text-neutral-500 block text-[10px]">
                                · {item.customization.selectedAddons.map(a => a.name).join(', ')}
                              </span>
                            )}
                            {item.customization?.specialInstructions && (
                              <span className="text-neutral-400 italic block text-[10px]">
                                "{item.customization.specialInstructions}"
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                            {settings.currencySymbol}{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Round Subtotal */}
                  <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                    <span>Round Total (incl. tax & svc)</span>
                    <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100 font-semibold">
                      {settings.currencySymbol}{order.total.toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {activeOrders.length > 0 && (
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                Total Session Tab
              </span>
              <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
                {settings.currencySymbol}{totalSessionBill.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onOrderMore}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Add Another Round
              </button>

              <button
                onClick={onOpenPayment}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 shadow-sm transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Settle Bill & Tip</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
