/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MenuSection } from './components/MenuSection.tsx';
import { FoodDetailModal } from './components/FoodDetailModal.tsx';
import { CartDrawer, CartItem } from './components/CartDrawer.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { TableSimulatorModal } from './components/TableSimulatorModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminAuthModal } from './components/AdminAuthModal.tsx';
import { KDSView } from './components/KDSView.tsx';
import { StoryAndInfoSection } from './components/StoryAndInfoSection.tsx';

import {
  MenuItem,
  MenuCategory,
  RestaurantSettings,
  DiningTable,
  TableSession,
  Order,
  WaiterProfile,
  CustomerReview,
  PaymentMethodType
} from './types/index.ts';
import { api } from './utils/api.ts';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [waiters, setWaiters] = useState<WaiterProfile[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);

  // Auth User state (Prisma Admin Auth)
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Table & Session State
  const [activeTableNumber, setActiveTableNumber] = useState<string | null>('02'); // Default to Table 02 for immediate rich testing
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [assignedWaiter, setAssignedWaiter] = useState<WaiterProfile | undefined>(undefined);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modal Views
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isKdsOpen, setIsKdsOpen] = useState(false);

  // Sync theme to <html> tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load initial restaurant data & Auth
  const loadInitialData = useCallback(async () => {
    try {
      // Check auth from token
      const me = await api.getMe();
      if (me?.user) {
        setAuthUser(me.user);
      }

      const [settingsData, menuData, tablesData, waitersData, reviewsData] = await Promise.all([
        api.getSettings(),
        api.getMenu(),
        api.getTables(),
        api.getWaiters(),
        api.getReviews(),
      ]);

      setSettings(settingsData);
      setCategories(menuData.categories);
      setMenuItems(menuData.items);
      setTables(tablesData);
      setWaiters(waitersData);
      setReviews(reviewsData);

      // Check URL query for ?table=XX&token=YY
      const urlParams = new URLSearchParams(window.location.search);
      const urlTable = urlParams.get('table');
      const urlToken = urlParams.get('token');

      const targetTable = urlTable || activeTableNumber || '02';
      const targetToken = urlToken || undefined;

      try {
        const sessionData = await api.getTableSession(targetTable, targetToken);
        setActiveTableNumber(sessionData.table.tableNumber);
        setCurrentSession(sessionData.session);
        setAssignedWaiter(sessionData.waiter);
        setSessionOrders(sessionData.orders);
      } catch (err) {
        console.warn('Could not bind initial table session:', err);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [activeTableNumber]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Refresh active orders periodically when session is active
  useEffect(() => {
    if (!activeTableNumber) return;
    const interval = setInterval(async () => {
      try {
        const orders = await api.getOrders({ tableNumber: activeTableNumber });
        setSessionOrders(orders);
      } catch (e) {
        // silent background polling
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTableNumber]);

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    customization: {
      selectedVariant?: any;
      selectedAddons?: any[];
      specialInstructions?: string;
    }
  ) => {
    const newCartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      quantity,
      selectedVariant: customization.selectedVariant,
      selectedAddons: customization.selectedAddons,
      specialInstructions: customization.specialInstructions,
    };
    setCartItems(prev => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
    const newCartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      quantity: 1,
      selectedVariant: item.variants && item.variants.length > 0 ? item.variants[0] : undefined,
    };
    setCartItems(prev => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(cartId);
      return;
    }
    setCartItems(prev =>
      prev.map(i => (i.id === cartId ? { ...i, quantity: qty } : i))
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Submit Order to Kitchen (validated server-side)
  const handleSubmitOrder = async (specialNotes?: string) => {
    if (!activeTableNumber) throw new Error('No table selected.');
    
    const payload = {
      tableNumber: activeTableNumber,
      sessionId: currentSession?.id,
      items: cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        customization: {
          selectedVariant: item.selectedVariant,
          selectedAddons: item.selectedAddons,
          specialInstructions: item.specialInstructions,
        },
      })),
      specialInstructions: specialNotes,
    };

    const res = await api.submitOrder(payload);
    setCartItems([]);
    setCurrentSession(res.session);
    setSessionOrders(prev => [res.order, ...prev]);
    setIsOrderTrackingOpen(true);
  };

  // Payment Handler
  const handleSubmitPayment = async (payload: {
    method: PaymentMethodType;
    tipAmount: number;
    waiterId?: string;
    transactionReference?: string;
    receiptNote?: string;
  }) => {
    if (!currentSession || !activeTableNumber) throw new Error('No active dining session to settle.');

    const res = await api.submitPayment({
      sessionId: currentSession.id,
      tableNumber: activeTableNumber,
      method: payload.method,
      tipAmount: payload.tipAmount,
      waiterId: payload.waiterId,
      transactionReference: payload.transactionReference,
      receiptNote: payload.receiptNote,
    });

    setCurrentSession(res.session);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setIsOrderTrackingOpen(false);
    setIsReviewOpen(true); // Prompt verified diner review immediately after settling bill!
  };

  // Submit review
  const handleSubmitReview = async (reviewData: Partial<CustomerReview>) => {
    const res = await api.submitReview({
      ...reviewData,
      sessionId: currentSession?.id,
      tableNumber: activeTableNumber || undefined,
    });
    setReviews(prev => [res.review, ...prev]);
  };

  // Switch table from simulator
  const handleSelectTableFromSimulator = async (table: DiningTable) => {
    try {
      const res = await api.getTableSession(table.tableNumber, table.qrSecretToken);
      setActiveTableNumber(res.table.tableNumber);
      setCurrentSession(res.session);
      setAssignedWaiter(res.waiter);
      setSessionOrders(res.orders);
    } catch (err) {
      console.error('Failed to change table:', err);
    }
  };

  const handleCloseSession = async (tableNumber: string) => {
    try {
      await api.closeTableSession(tableNumber);
      if (activeTableNumber === tableNumber) {
        setCurrentSession(null);
        setSessionOrders([]);
      }
      const updatedTables = await api.getTables();
      setTables(updatedTables);
    } catch (err) {
      console.error('Failed to close session:', err);
    }
  };

  const handleOpenStaffPortal = () => {
    if (authUser) {
      setIsAdminOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setAuthUser(user);
    setIsAdminOpen(true);
  };

  const handleLogout = async () => {
    await api.logout();
    setAuthUser(null);
    setIsAdminOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`${id}-section`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-300 font-mono text-sm">
        Summoning L'Aura Gastronomic Core & Prisma Database...
      </div>
    );
  }

  // If in dedicated full-screen KDS mode
  if (isKdsOpen) {
    return <KDSView onBackToApp={() => setIsKdsOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 transition-colors">
      
      {/* 1. Header Navigation Bar */}
      <Navbar
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenStaff={handleOpenStaffPortal}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        authUser={authUser}
        currentSession={currentSession}
        activeTableNumber={activeTableNumber}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onNavigate={scrollToSection}
      />

      {/* Floating Active Order Tracker pill for diners currently seated */}
      {sessionOrders.length > 0 && (
        <div className="fixed bottom-5 left-5 z-40 animate-bounce">
          <button
            onClick={() => setIsOrderTrackingOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900/90 text-amber-300 dark:bg-amber-400 dark:text-neutral-950 font-medium text-xs shadow-xl border border-amber-500/30 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-neutral-950 animate-ping"></span>
            <span>Table {activeTableNumber}: {sessionOrders.length} Course Round Active (Track Order)</span>
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <HeroSection
        settings={settings}
        onExploreMenu={() => scrollToSection('menu')}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        activeTableNumber={activeTableNumber}
      />

      {/* 3. Digital Menu Section */}
      <MenuSection
        categories={categories}
        items={menuItems}
        currencySymbol={settings.currencySymbol}
        onSelectItem={item => setSelectedMenuItem(item)}
        onQuickAdd={handleQuickAdd}
      />

      {/* 4. Culinary Story, Information, Reviews, and Footer */}
      <StoryAndInfoSection
        settings={settings}
        reviews={reviews}
        onOpenReviewModal={() => setIsReviewOpen(true)}
        currencySymbol={settings.currencySymbol}
      />

      {/* ============================================================== */}
      {/* MODALS & DRAWERS */}
      {/* ============================================================== */}

      {/* Staff Admin Auth Modal with 1-Click Testing Logins */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={authUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Dish Customization Modal */}
      <FoodDetailModal
        item={selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
        onAddToCart={handleAddToCart}
        currencySymbol={settings.currencySymbol}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        tableNumber={activeTableNumber}
        onOpenTableSelector={() => {
          setIsCartOpen(false);
          setIsSimulatorOpen(true);
        }}
        onSubmitOrder={handleSubmitOrder}
        settings={settings}
        currentSession={currentSession}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={sessionOrders}
        tableNumber={activeTableNumber}
        settings={settings}
        onOpenPayment={() => {
          setIsOrderTrackingOpen(false);
          setIsPaymentOpen(true);
        }}
        onOrderMore={() => {
          setIsOrderTrackingOpen(false);
          scrollToSection('menu');
        }}
      />

      {/* Payment & Waiter Tipping Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        session={currentSession}
        tableNumber={activeTableNumber}
        settings={settings}
        waiters={waiters}
        assignedWaiter={assignedWaiter}
        onSubmitPayment={handleSubmitPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Verified Diner Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        tableNumber={activeTableNumber}
        sessionId={currentSession?.id}
        onSubmitReview={handleSubmitReview}
      />

      {/* Table QR Simulator & Flyer Preview Modal */}
      <TableSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        tables={tables}
        currentTableNumber={activeTableNumber}
        onSelectTable={handleSelectTableFromSimulator}
        onCloseSession={handleCloseSession}
      />

      {/* Full Admin & Operations Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          onOpenKds={() => {
            setIsAdminOpen(false);
            setIsKdsOpen(true);
          }}
          initialSettings={settings}
          onSettingsUpdated={newSettings => setSettings(newSettings)}
          authUser={authUser}
          onLogout={handleLogout}
        />
      )}

    </div>
  );
}
