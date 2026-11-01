import {
  MenuItem,
  MenuCategory,
  DiningTable,
  Order,
  PaymentRecord,
  RestaurantSettings,
  WaiterProfile,
  CustomerReview,
  TableSession
} from '../types/index.ts';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('AURA_AUTH_TOKEN');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ==========================================
  // Auth & Testing Credentials
  // ==========================================
  async getTestingAccounts(): Promise<{ role: string; email: string; password: string; name: string }[]> {
    const res = await fetch(`${BASE_URL}/auth/testing-accounts`);
    if (!res.ok) throw new Error('Failed to load testing accounts');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Authentication failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('AURA_AUTH_TOKEN', data.token);
      localStorage.setItem('AURA_AUTH_USER', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(): Promise<{ user: any } | null> {
    const token = localStorage.getItem('AURA_AUTH_TOKEN');
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      localStorage.removeItem('AURA_AUTH_TOKEN');
      localStorage.removeItem('AURA_AUTH_USER');
      return null;
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } finally {
      localStorage.removeItem('AURA_AUTH_TOKEN');
      localStorage.removeItem('AURA_AUTH_USER');
    }
  },

  // ==========================================
  // Restaurant Settings
  // ==========================================
  async getSettings(): Promise<RestaurantSettings> {
    const res = await fetch(`${BASE_URL}/restaurant`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const res = await fetch(`${BASE_URL}/restaurant`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const data = await res.json();
    return data.settings;
  },

  // ==========================================
  // Menu
  // ==========================================
  async getMenu(params?: { categoryId?: string; dietary?: string; search?: string; availableOnly?: boolean }): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.dietary) query.set('dietary', params.dietary);
    if (params?.search) query.set('search', params.search);
    if (params?.availableOnly) query.set('availableOnly', 'true');

    const res = await fetch(`${BASE_URL}/menu?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  async createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`${BASE_URL}/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  async updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`${BASE_URL}/menu/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async deleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/menu/items/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
  },

  // ==========================================
  // Tables & QR
  // ==========================================
  async getTables(): Promise<(DiningTable & { session?: TableSession; waiter?: WaiterProfile; activeOrders?: Order[]; totalBill?: number })[]> {
    const res = await fetch(`${BASE_URL}/tables`);
    if (!res.ok) throw new Error('Failed to load tables');
    return res.json();
  },

  async updateTable(id: string, updates: Partial<DiningTable>): Promise<DiningTable> {
    const res = await fetch(`${BASE_URL}/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update table');
    return res.json();
  },

  async getTableSession(tableNumber: string, token?: string): Promise<{
    table: DiningTable;
    session: TableSession;
    waiter?: WaiterProfile;
    orders: Order[];
    settings: RestaurantSettings;
  }> {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    const res = await fetch(`${BASE_URL}/tables/${tableNumber}/session${query}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authenticate table session');
    }
    return res.json();
  },

  async closeTableSession(tableNumber: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/tables/${tableNumber}/session/close`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to close table session');
  },

  // ==========================================
  // Orders
  // ==========================================
  async submitOrder(payload: {
    tableNumber: string;
    sessionId?: string;
    items: {
      menuItemId: string;
      quantity: number;
      customization?: {
        selectedVariant?: any;
        selectedAddons?: any[];
        specialInstructions?: string;
      };
    }[];
    specialInstructions?: string;
  }): Promise<{ success: boolean; order: Order; session: TableSession }> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit order');
    }
    return res.json();
  },

  async getOrders(params?: { tableNumber?: string; status?: string; sessionId?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.tableNumber) query.set('tableNumber', params.tableNumber);
    if (params?.status) query.set('status', params.status);
    if (params?.sessionId) query.set('sessionId', params.sessionId);

    const res = await fetch(`${BASE_URL}/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(id: string, updates: { status?: string; cancellationReason?: string; kdsStatus?: string; itemId?: string }): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // ==========================================
  // Payments
  // ==========================================
  async submitPayment(payload: {
    sessionId: string;
    tableNumber: string;
    method: string;
    tipAmount?: number;
    waiterId?: string;
    transactionReference?: string;
    receiptNote?: string;
  }): Promise<{ success: boolean; payment: PaymentRecord; session: TableSession }> {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit payment');
    }
    return res.json();
  },

  async verifyPayment(id: string, action: 'approve' | 'reject', staffName?: string): Promise<{ success: boolean; payment: PaymentRecord }> {
    const res = await fetch(`${BASE_URL}/payments/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action, staffName }),
    });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch(`${BASE_URL}/payments`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load payments');
    return res.json();
  },

  // ==========================================
  // Waiters & Tips
  // ==========================================
  async getWaiters(): Promise<WaiterProfile[]> {
    const res = await fetch(`${BASE_URL}/waiters`);
    if (!res.ok) throw new Error('Failed to load waiters');
    return res.json();
  },

  async getTipsAnalytics(): Promise<{
    totalTips: number;
    pendingTips: number;
    byWaiter: { waiterId: string; waiterName: string; photoUrl: string; count: number; amount: number }[];
    recentTips: any[];
  }> {
    const res = await fetch(`${BASE_URL}/tips/analytics`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load tips analytics');
    return res.json();
  },

  // ==========================================
  // Reviews
  // ==========================================
  async getReviews(): Promise<CustomerReview[]> {
    const res = await fetch(`${BASE_URL}/reviews`);
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
  },

  async submitReview(review: Partial<CustomerReview>): Promise<{ success: boolean; review: CustomerReview }> {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  async moderateReview(id: string, updates: { isModerated?: boolean; adminReply?: string }): Promise<CustomerReview> {
    const res = await fetch(`${BASE_URL}/reviews/${id}/moderate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to moderate review');
    return res.json();
  },

  // ==========================================
  // Analytics & KDS
  // ==========================================
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${BASE_URL}/analytics`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  async getKdsOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/kds`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load KDS orders');
    return res.json();
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch(`${BASE_URL}/system/reset`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to reset database');
  },
};
