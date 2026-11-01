import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, AlertTriangle, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../utils/api.ts';

interface KDSViewProps {
  onBackToApp: () => void;
}

export const KDSView: React.FC<KDSViewProps> = ({ onBackToApp }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedItemIds, setCompletedItemIds] = useState<Record<string, boolean>>({});

  const loadKds = async () => {
    try {
      const data = await api.getKdsOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load KDS orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKds();
    const interval = setInterval(loadKds, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status });
      await loadKds();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleItemDone = (itemId: string) => {
    setCompletedItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Helper to calculate minutes elapsed
  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* KDS Header */}
      <header className="h-16 px-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-amber-400" />
          <h1 className="text-lg font-mono font-bold tracking-wider">
            L'AURA KITCHEN DISPLAY SYSTEM (KDS)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
            {orders.length} Active Tickets
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadKds}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onBackToApp}
            className="px-4 py-2 text-xs font-mono font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Exit KDS Mode
          </button>
        </div>
      </header>

      {/* Main Tickets Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-neutral-500 font-mono">
            Loading kitchen tickets...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center text-neutral-500 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="font-mono text-base text-neutral-300">All Kitchen Orders Cleared & Served</p>
            <p className="text-xs max-w-sm">New orders placed by guests via Table QR codes will instantly populate here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {orders.map(order => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsed >= 18;
              const isWarning = elapsed >= 12 && elapsed < 18;

              return (
                <div
                  key={order.id}
                  className={`flex flex-col rounded-xl border bg-neutral-900 overflow-hidden shadow-lg transition-all ${
                    isUrgent
                      ? 'border-rose-500 ring-1 ring-rose-500/40'
                      : isWarning
                      ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                      : 'border-neutral-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-4 flex items-center justify-between ${
                    isUrgent ? 'bg-rose-950/60' : isWarning ? 'bg-amber-950/50' : 'bg-neutral-800/60'
                  }`}>
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {order.orderNumber}
                      </span>
                      <h3 className="text-xl font-mono font-bold text-white">
                        TABLE {order.tableNumber}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center gap-1 font-mono text-xs font-bold ${
                        isUrgent ? 'text-rose-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-neutral-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed}m ago</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Est: {order.estimatedMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 p-4 space-y-3 divide-y divide-neutral-800">
                    {order.items.map(item => {
                      const isItemDone = completedItemIds[item.id];

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemDone(item.id)}
                          className={`pt-2.5 first:pt-0 cursor-pointer select-none group transition-opacity ${
                            isItemDone ? 'opacity-40 line-through' : 'opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300">
                              {item.quantity}x {item.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={!!isItemDone}
                              onChange={() => {}}
                              className="mt-1 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0"
                            />
                          </div>

                          {/* Customization Details */}
                          {item.customization?.selectedVariant && (
                            <p className="text-xs text-amber-400 font-mono mt-0.5">
                              [Doneness]: {item.customization.selectedVariant.name}
                            </p>
                          )}

                          {item.customization?.selectedAddons && item.customization.selectedAddons.length > 0 && (
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              + {item.customization.selectedAddons.map(a => a.name).join(', ')}
                            </p>
                          )}

                          {item.customization?.specialInstructions && (
                            <div className="mt-1 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                              ⚠️ Note: {item.customization.specialInstructions}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Bar */}
                  <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                    {order.status === 'Order Placed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                        className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Accept & Fire</span>
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Ready to Serve')}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass Ready</span>
                      </button>
                    )}

                    {order.status === 'Ready to Serve' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Served')}
                        className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Mark Served to Table</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
