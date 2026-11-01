import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Users,
  CreditCard,
  Star,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  DiningTable,
  MenuItem,
  MenuCategory,
  Order,
  PaymentRecord,
  RestaurantSettings,
  WaiterProfile,
  CustomerReview,
  StaffRole
} from '../types/index.ts';
import { api } from '../utils/api.ts';

interface AdminDashboardProps {
  onClose: () => void;
  onOpenKds: () => void;
  initialSettings: RestaurantSettings;
  onSettingsUpdated: (newSettings: RestaurantSettings) => void;
  authUser: any | null;
  onLogout: () => void;
}

type TabType = 'overview' | 'tables' | 'orders' | 'services' | 'reservations' | 'menu' | 'waiters' | 'payments' | 'reviews' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onOpenKds,
  initialSettings,
  onSettingsUpdated,
  authUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentRole, setCurrentRole] = useState<StaffRole>(authUser?.role || 'Owner');
  const [analytics, setAnalytics] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [waiters, setWaiters] = useState<WaiterProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [tipsAnalytics, setTipsAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<RestaurantSettings>(initialSettings);
  const [loading, setLoading] = useState(true);

  // Modals / Item forms
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<Partial<MenuItem> | null>(null);
  const [selectedTableDetail, setSelectedTableDetail] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<{ [id: string]: string }>({});

  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isFloorPlanMapOpen, setIsFloorPlanMapOpen] = useState(false);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        tablesData,
        ordersData,
        menuData,
        waitersData,
        paymentsData,
        reviewsData,
        tipsData,
        settingsData,
        servicesData,
        reservationsData
      ] = await Promise.all([
        api.getAnalytics(),
        api.getTables(),
        api.getOrders(),
        api.getMenu(),
        api.getWaiters(),
        api.getPayments(),
        api.getReviews(),
        api.getTipsAnalytics(),
        api.getSettings(),
        api.getServiceRequests(),
        api.getReservations(),
      ]);

      setAnalytics(statsData);
      setTables(tablesData);
      setOrders(ordersData);
      setMenuItems(menuData.items);
      setCategories(menuData.categories);
      setWaiters(waitersData);
      setPayments(paymentsData);
      setReviews(reviewsData);
      setTipsAnalytics(tipsData);
      setSettings(settingsData);
      setServiceRequests(servicesData);
      setReservations(reservationsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, { status });
      await refreshAll();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Payment verification
  const handleVerifyPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      await api.verifyPayment(paymentId, action, `Admin / ${currentRole}`);
      await refreshAll();
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  // Save menu item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuItem) return;

    try {
      if (selectedMenuItem.id) {
        await api.updateMenuItem(selectedMenuItem.id, selectedMenuItem);
      } else {
        await api.createMenuItem(selectedMenuItem);
      }
      setIsEditingItem(false);
      setSelectedMenuItem(null);
      await refreshAll();
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await api.deleteMenuItem(id);
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      onSettingsUpdated(updated);
      alert('Restaurant settings updated successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Reply to review
  const handleReplyReview = async (reviewId: string) => {
    const text = adminReplyText[reviewId];
    if (!text) return;
    try {
      await api.moderateReview(reviewId, { adminReply: text });
      setAdminReplyText(prev => ({ ...prev, [reviewId]: '' }));
      await refreshAll();
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-neutral-100 font-sans">
      
      {/* Top Bar */}
      <header className="h-16 px-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            title="Return to Public Experience"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-serif tracking-widest text-amber-400 uppercase font-semibold">
              {settings.name}
            </span>
            <h1 className="text-sm font-semibold text-white">
              Operations & Administration Ecosystem
            </h1>
          </div>
        </div>

        {/* Staff Role Switcher & KDS Quick Launch */}
        <div className="flex items-center gap-3">
          {authUser && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-800 text-xs border border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-neutral-200">{authUser.name}</span>
              <span className="text-[10px] text-amber-300 font-mono">[{authUser.role}]</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Role View:</span>
            <select
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value as StaffRole)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="Owner">Owner (Full Access)</option>
              <option value="Admin / Manager">Admin / Manager</option>
              <option value="Waiter">Floor Waiter</option>
              <option value="Cashier">Cashier</option>
              <option value="Kitchen Staff">Kitchen Staff</option>
            </select>
          </div>

          <button
            onClick={onOpenKds}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs shadow-xs"
          >
            <ChefHat className="w-4 h-4" />
            <span>Launch KDS</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs transition-colors"
          >
            Sign Out
          </button>

          <button
            onClick={refreshAll}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-56 bg-neutral-900/70 border-r border-neutral-800 flex flex-col shrink-0 p-3 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'tables' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span>Table Floor Plan</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
              {tables.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Live Orders Feed</span>
            </div>
            {analytics?.pendingOrdersCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950">
                {analytics.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'services' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-amber-400">🔔</span>
              <span>Service Calls</span>
            </div>
            {serviceRequests.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                {serviceRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'reservations' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-amber-400">📅</span>
              <span>Table Bookings</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'menu' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Digital Menu CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('waiters')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'waiters' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Waiters & Tips</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'payments' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Payment Verification</span>
            </div>
            {analytics?.pendingPaymentsCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                {analytics.pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'reviews' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reviews & Ratings</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Restaurant Settings</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-neutral-950">
          
          {/* ============================================================== */}
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Executive Operations Overview
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Real-time financial performance, floor turnover, pending kitchen tickets, and staff gratuity.
                </p>
              </div>

              {/* KPI Cards Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Total Settled Revenue</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {settings.currencySymbol}{(analytics?.totalRevenue || 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-neutral-500">Verified gateway + cash</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Active Tables</span>
                  <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {analytics?.activeTablesCount || 0} / {analytics?.totalTables || 8}
                  </div>
                  <span className="text-[10px] text-neutral-500">{analytics?.availableTablesCount || 0} ready for seating</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Total Gratuity Distributed</span>
                  <div className="text-2xl font-mono font-bold text-amber-300 mt-1">
                    {settings.currencySymbol}{(analytics?.totalTips || 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-neutral-500">To floor & sommeliers</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">Guest Satisfaction</span>
                  <div className="text-2xl font-mono font-bold text-white mt-1 flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{analytics?.avgRating || 4.9}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{analytics?.totalReviews || 3} verified diner ratings</span>
                </div>
              </div>

              {/* Quick Actions & Pending Attention Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pending Payments awaiting cashier verification */}
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Pending Payment Verifications ({payments.filter(p => p.status === 'pending_verification').length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {payments.filter(p => p.status === 'pending_verification').length === 0 ? (
                      <p className="text-xs text-neutral-500 py-3">All payments verified.</p>
                    ) : (
                      payments.filter(p => p.status === 'pending_verification').map(p => (
                        <div key={p.id} className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-amber-300">Table {p.tableNumber}</span>
                            <span className="text-neutral-400 ml-2">· {p.method}</span>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Ref: {p.transactionReference || 'Customer reported transfer'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white mr-2">
                              {settings.currencySymbol}{p.totalAmount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'approve')}
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Staff Tips Breakdown */}
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Waiter Service Performance</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('waiters')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Manage Waiters
                    </button>
                  </div>

                  <div className="space-y-3">
                    {waiters.map(w => (
                      <div key={w.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={w.photoUrl}
                            alt={w.name}
                            className="w-8 h-8 rounded-full object-cover bg-neutral-800"
                          />
                          <div>
                            <p className="font-semibold text-neutral-200">{w.name}</p>
                            <p className="text-[10px] text-neutral-400">{w.role}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-400">
                            {settings.currencySymbol}{w.totalTips.toFixed(2)}
                          </span>
                          <span className="block text-[10px] text-neutral-500">earned tips</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TABLE FLOOR PLAN */}
          {/* ============================================================== */}
          {activeTab === 'tables' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-white">
                    Interactive Table Layout & Status
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Monitor live dining sessions, order totals, and table turnover.
                  </p>
                </div>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tables.map(table => {
                  const statusColors: Record<string, string> = {
                    Available: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                    Occupied: 'border-sky-500/40 bg-sky-950/20 text-sky-300',
                    Ordering: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                    Preparing: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
                    Served: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                    'Awaiting Payment': 'border-rose-500/40 bg-rose-950/20 text-rose-300',
                    Cleaning: 'border-neutral-700 bg-neutral-900 text-neutral-400',
                  };

                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTableDetail(table)}
                      className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-48 ${
                        statusColors[table.status] || 'border-neutral-800 bg-neutral-900 text-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-mono font-bold text-white">
                            Table {table.tableNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/40">
                            {table.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {table.section} · {table.capacity} Seats
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Assigned Waiter:</span>
                          <span className="font-medium text-neutral-200">{table.waiter?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Active Tab:</span>
                          <span className="font-mono font-bold text-amber-300">
                            {settings.currencySymbol}{(table.totalBill || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Details Modal */}
              {selectedTableDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-white">
                          Table {selectedTableDetail.tableNumber} Management
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {selectedTableDetail.section} · Capacity: {selectedTableDetail.capacity}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTableDetail(null)}
                        className="text-neutral-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-400">Current Status:</span>
                        <select
                          value={selectedTableDetail.status}
                          onChange={async e => {
                            const newStatus = e.target.value;
                            await api.updateTable(selectedTableDetail.id, { status: newStatus as any });
                            setSelectedTableDetail({ ...selectedTableDetail, status: newStatus });
                            await refreshAll();
                          }}
                          className="bg-neutral-800 border border-neutral-700 text-amber-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Ordering">Ordering</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Served">Served</option>
                          <option value="Awaiting Payment">Awaiting Payment</option>
                          <option value="Cleaning">Cleaning</option>
                        </select>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-400">Assigned Waiter:</span>
                        <select
                          value={selectedTableDetail.assignedWaiterId || ''}
                          onChange={async e => {
                            const newWaiterId = e.target.value;
                            await api.updateTable(selectedTableDetail.id, { assignedWaiterId: newWaiterId });
                            setSelectedTableDetail({ ...selectedTableDetail, assignedWaiterId: newWaiterId });
                            await refreshAll();
                          }}
                          className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded px-2 py-1 text-xs"
                        >
                          {waiters.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-400">QR Security Token:</span>
                        <span className="font-mono text-neutral-300">{selectedTableDetail.qrSecretToken}</span>
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={async () => {
                          await api.closeTableSession(selectedTableDetail.tableNumber);
                          setSelectedTableDetail(null);
                          await refreshAll();
                        }}
                        className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-medium"
                      >
                        Reset / End Table Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: LIVE ORDERS FEED */}
          {/* ============================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Real-Time Orders Management
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Track incoming courses, manage statuses, and oversee kitchen fulfillment.
                </p>
              </div>

              <div className="space-y-3">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-amber-400">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-200">
                          Table {order.tableNumber}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 pt-1">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(' · ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-neutral-400 block">Total Bill</span>
                        <span className="text-base font-mono font-bold text-white">
                          {settings.currencySymbol}{order.total.toFixed(2)}
                        </span>
                      </div>

                      <select
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready to Serve">Ready to Serve</option>
                        <option value="Served">Served</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: SERVICE BELL CALLS */}
          {/* ============================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-white">
                    Tableside Guest Service Pagers
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Live requests summoned by seated diners via table digital service bell.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-neutral-800 text-amber-400 border border-neutral-700">
                  {serviceRequests.length} Active Calls
                </span>
              </div>

              {serviceRequests.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <span className="text-3xl block">🔔</span>
                  <p className="font-serif text-base text-neutral-300">All Tableside Pagers Clear</p>
                  <p className="text-xs text-neutral-500">When seated diners ring for water, sommelier, or bill, alerts appear here instantly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-mono font-bold text-amber-400">
                            Table {req.tableNumber}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {req.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1">
                          {req.requestType}
                        </h4>
                        {req.note && (
                          <p className="text-xs italic text-neutral-400 mt-1 bg-neutral-800/60 p-2 rounded-lg">
                            "{req.note}"
                          </p>
                        )}
                        <span className="text-[10px] text-neutral-500 block mt-2">
                          Summoned {new Date(req.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-neutral-800 flex gap-2">
                        <button
                          onClick={async () => {
                            await api.updateServiceRequestStatus(req.id, 'Resolved');
                            await refreshAll();
                          }}
                          className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
                        >
                          Mark Handled & Clear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: RESERVATIONS & BOOKINGS */}
          {/* ============================================================== */}
          {activeTab === 'reservations' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Table Reservations & Guest Bookings
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage incoming party bookings, preferred atmospheres, and occasion notes.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/60 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Booking Code</th>
                      <th className="p-3.5">Guest & Contact</th>
                      <th className="p-3.5">Party Size</th>
                      <th className="p-3.5">Date & Seating</th>
                      <th className="p-3.5">Atmosphere</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          No table reservations booked yet.
                        </td>
                      </tr>
                    ) : (
                      reservations.map(res => (
                        <tr key={res.id} className="hover:bg-neutral-800/40">
                          <td className="p-3.5 font-mono font-bold text-amber-400">
                            {res.bookingCode}
                          </td>
                          <td className="p-3.5">
                            <strong className="text-neutral-100 block">{res.guestName}</strong>
                            <span className="text-[10px] text-neutral-400">{res.guestEmail}</span>
                          </td>
                          <td className="p-3.5 font-mono">
                            {res.partySize} Guests
                          </td>
                          <td className="p-3.5">
                            <span className="text-neutral-200 block">{res.date}</span>
                            <span className="font-mono text-neutral-400 text-[10px]">{res.timeSlot}</span>
                          </td>
                          <td className="p-3.5 text-neutral-300">
                            {res.section}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: DIGITAL MENU CRUD */}
          {/* ============================================================== */}
          {activeTab === 'menu' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-white">
                    Digital Menu Catalog & Pricing
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Add new tasting dishes, manage pricing, sold-out flags, and culinary ingredients.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedMenuItem({
                      name: '',
                      description: '',
                      price: 28.00,
                      preparationMinutes: 15,
                      categoryId: categories[0]?.id || 'cat-1',
                      isAvailable: true,
                      isSoldOut: false,
                      isFeatured: false,
                      dietary: ['Chef Special'],
                      ingredients: ['Seasonal harvest'],
                      allergens: [],
                      image: '/src/assets/images/food_signature_wagyu_1793555392859.jpg',
                    });
                    setIsEditingItem(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Dish</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/60 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Dish</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-neutral-800/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-950 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-neutral-100">{item.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate max-w-xs">{item.description}</p>
                          </div>
                        </td>

                        <td className="p-3.5 text-neutral-400">
                          {categories.find(c => c.id === item.categoryId)?.name || 'General'}
                        </td>

                        <td className="p-3.5 font-mono font-semibold text-amber-300">
                          {settings.currencySymbol}{item.price.toFixed(2)}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={async () => {
                              await api.updateMenuItem(item.id, { isSoldOut: !item.isSoldOut });
                              await refreshAll();
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.isSoldOut
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.isSoldOut ? 'Sold Out' : 'Active'}
                          </button>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedMenuItem(item);
                                setIsEditingItem(true);
                              }}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Dish Modal */}
              {isEditingItem && selectedMenuItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-serif font-bold text-white">
                        {selectedMenuItem.id ? 'Edit Menu Dish' : 'Create New Menu Dish'}
                      </h3>
                      <button onClick={() => setIsEditingItem(false)} className="text-neutral-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
                      <div>
                        <label className="text-neutral-400 block mb-1">Dish Name</label>
                        <input
                          type="text"
                          required
                          value={selectedMenuItem.name || ''}
                          onChange={e => setSelectedMenuItem({ ...selectedMenuItem, name: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-neutral-400 block mb-1">Category</label>
                          <select
                            value={selectedMenuItem.categoryId}
                            onChange={e => setSelectedMenuItem({ ...selectedMenuItem, categoryId: e.target.value })}
                            className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-neutral-400 block mb-1">Price ({settings.currencySymbol})</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={selectedMenuItem.price || 0}
                            onChange={e => setSelectedMenuItem({ ...selectedMenuItem, price: Number(e.target.value) })}
                            className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-neutral-400 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={selectedMenuItem.description || ''}
                          onChange={e => setSelectedMenuItem({ ...selectedMenuItem, description: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-400 block mb-1">Image URL / Path</label>
                        <input
                          type="text"
                          value={selectedMenuItem.image || ''}
                          onChange={e => setSelectedMenuItem({ ...selectedMenuItem, image: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedMenuItem.isFeatured}
                            onChange={e => setSelectedMenuItem({ ...selectedMenuItem, isFeatured: e.target.checked })}
                            className="rounded bg-neutral-800 text-amber-500"
                          />
                          <span>Chef's Signature</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedMenuItem.isSoldOut}
                            onChange={e => setSelectedMenuItem({ ...selectedMenuItem, isSoldOut: e.target.checked })}
                            className="rounded bg-neutral-800 text-rose-500"
                          />
                          <span>Mark as Sold Out</span>
                        </label>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                        >
                          Save Dish
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: WAITERS & TIPS */}
          {/* ============================================================== */}
          {activeTab === 'waiters' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Waiter Hospitality & Gratuity Ledger
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Floor associates, assigned tables, customer feedback, and transparent tips distributions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {waiters.map(waiter => (
                  <div key={waiter.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={waiter.photoUrl}
                        alt={waiter.name}
                        className="w-12 h-12 rounded-full object-cover bg-neutral-800"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{waiter.name}</h4>
                        <p className="text-[10px] text-neutral-400">{waiter.role} · {waiter.employeeId}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{waiter.rating.toFixed(1)} rating</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-neutral-800/50 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Assigned Tables:</span>
                        <span className="font-mono text-neutral-200">{waiter.assignedTables.join(', ') || 'Floor Floating'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Tips Received:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {settings.currencySymbol}{waiter.totalTips.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent tips ledger */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="text-sm font-semibold text-white">Recent Gratuity Transactions</h3>
                <div className="divide-y divide-neutral-800 text-xs">
                  {(tipsAnalytics?.recentTips || []).map((tip: any) => (
                    <div key={tip.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-neutral-200">Table {tip.tableNumber}</span>
                        <span className="text-neutral-400 ml-2">tipped {tip.waiterName}</span>
                        <span className="text-[10px] text-neutral-500 block">{new Date(tip.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          +{settings.currencySymbol}{tip.amount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-emerald-400">{tip.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: PAYMENT VERIFICATION */}
          {/* ============================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Payment Verification & Financial Records
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Cashier settlement verification for QR code transfers and waiter cash collection.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/60 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Table</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Bill + Tip</th>
                      <th className="p-3.5">Reference Note</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-neutral-800/40">
                        <td className="p-3.5 font-mono font-bold text-white">
                          Table {payment.tableNumber}
                        </td>
                        <td className="p-3.5 text-neutral-300">
                          {payment.method}
                        </td>
                        <td className="p-3.5 font-mono">
                          <strong className="text-white">{settings.currencySymbol}{payment.totalAmount.toFixed(2)}</strong>
                          {payment.tipAmount > 0 && (
                            <span className="text-[10px] text-amber-400 block">
                              (incl. {settings.currencySymbol}{payment.tipAmount.toFixed(2)} tip)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-neutral-400 max-w-xs truncate">
                          {payment.transactionReference || payment.receiptNote || '—'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            payment.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                            payment.status === 'pending_verification' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {payment.status === 'pending_verification' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleVerifyPayment(payment.id, 'approve')}
                                className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(payment.id, 'reject')}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-500">
                              {payment.verifiedBy || 'Completed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: REVIEWS & MODERATION */}
          {/* ============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Verified Diner Feedback & Moderation
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Respond to guest dining critiques and moderate public display.
                </p>
              </div>

              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{review.customerName}</h4>
                          {review.isVerifiedDiner && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                              Verified Dining Session
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{review.overallRating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {review.adminReply && (
                      <div className="p-3 rounded-lg bg-neutral-800/70 border border-neutral-700/60 text-xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-400">Restaurant Executive Response:</span>
                        <p className="text-neutral-200">{review.adminReply}</p>
                      </div>
                    )}

                    {/* Reply input */}
                    {!review.adminReply && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={adminReplyText[review.id] || ''}
                          onChange={e => setAdminReplyText({ ...adminReplyText, [review.id]: e.target.value })}
                          placeholder="Write official response to guest..."
                          className="flex-1 p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white"
                        />
                        <button
                          onClick={() => handleReplyReview(review.id)}
                          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                        >
                          Post Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: RESTAURANT SETTINGS */}
          {/* ============================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Restaurant Profile & Configuration
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Adjust tax formulas, service charges, currency symbols, and QR merchant settings.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Branding & Identity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-neutral-400 block mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={e => setSettings({ ...settings, name: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={settings.description}
                      onChange={e => setSettings({ ...settings, description: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Financial & Tax Engine</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-neutral-400 block mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={settings.currencySymbol}
                        onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.taxRatePercent}
                        onChange={e => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Service Charge (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.serviceChargePercent}
                        onChange={e => setSettings({ ...settings, serviceChargePercent: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white">QR Payment Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-neutral-400 block mb-1">Merchant Display Name</label>
                      <input
                        type="text"
                        value={settings.qrPaymentDetails.merchantName}
                        onChange={e => setSettings({
                          ...settings,
                          qrPaymentDetails: { ...settings.qrPaymentDetails, merchantName: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Merchant Account / IBAN</label>
                      <input
                        type="text"
                        value={settings.qrPaymentDetails.accountNumber}
                        onChange={e => setSettings({
                          ...settings,
                          qrPaymentDetails: { ...settings.qrPaymentDetails, accountNumber: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                  >
                    Save All Settings
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Reset entire restaurant demo state to initial Michelin seed data?')) return;
                      await api.resetDatabase();
                      await refreshAll();
                      alert('Database reset to fresh state.');
                    }}
                    className="px-4 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    Reset Demo State
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
