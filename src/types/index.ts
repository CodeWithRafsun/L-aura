export type DietaryTag = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Halal' | 'Chef Special' | 'Spicy';

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  preparationMinutes: number;
  isAvailable: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  dietary: DietaryTag[];
  ingredients: string[];
  allergens: string[];
  variants?: MenuVariant[];
  addons?: MenuAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  description?: string;
  iconName?: string;
}

export type TableStatus = 'Available' | 'Occupied' | 'Ordering' | 'Preparing' | 'Served' | 'Awaiting Payment' | 'Cleaning';

export interface DiningTable {
  id: string;
  tableNumber: string;
  capacity: number;
  section: string; // e.g. "Main Dining Room", "Window Alcove", "Private Lounge", "Garden Terrace"
  status: TableStatus;
  assignedWaiterId?: string;
  currentSessionId?: string;
  qrCodeUrl: string;
  qrSecretToken: string;
}

export type OrderStatus = 'Order Placed' | 'Order Confirmed' | 'Preparing' | 'Ready to Serve' | 'Served' | 'Completed' | 'Cancelled';

export interface OrderItemCustomization {
  selectedVariant?: MenuVariant;
  selectedAddons?: MenuAddon[];
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: OrderItemCustomization;
  kdsStatus?: 'Pending' | 'Preparing' | 'Ready' | 'Served';
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  sessionId: string;
  waiterId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedMinutes: number;
  cancellationReason?: string;
}

export type PaymentMethodType = 
  | 'Cash at Counter'
  | 'Cash to Waiter'
  | 'QR Code Payment'
  | 'Mobile Financial Services'
  | 'Online Card';

export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';

export interface PaymentRecord {
  id: string;
  orderId?: string;
  sessionId: string;
  tableNumber: string;
  method: PaymentMethodType;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  transactionReference?: string;
  receiptNote?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface WaiterProfile {
  id: string;
  employeeId: string;
  name: string;
  photoUrl: string;
  role: string;
  phone: string;
  email: string;
  assignedTables: string[];
  isActive: boolean;
  totalTips: number;
  rating: number;
  ratingCount: number;
}

export interface TipRecord {
  id: string;
  tableNumber: string;
  sessionId: string;
  orderId?: string;
  waiterId: string;
  waiterName: string;
  amount: number;
  percentage?: number;
  paymentMethod: PaymentMethodType;
  status: 'paid' | 'pending';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  sessionId?: string;
  tableNumber?: string;
  customerName: string;
  overallRating: number; // 1-5
  foodRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  valueRating: number;
  comment: string;
  photoUrl?: string;
  isVerifiedDiner: boolean;
  isModerated: boolean;
  adminReply?: string;
  createdAt: string;
}

export interface TableSession {
  id: string;
  tableNumber: string;
  token: string;
  startedAt: string;
  activeOrderIds: string[];
  subtotalAccumulated: number;
  taxAccumulated: number;
  serviceChargeAccumulated: number;
  totalAccumulated: number;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  reviewSubmitted?: boolean;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercent: number;
  serviceChargePercent: number;
  openingHours: string;
  weeklySchedule: { day: string; hours: string; isOpen: boolean }[];
  cuisineTypes: string[];
  facilities: string[];
  qrPaymentDetails: {
    merchantName: string;
    accountNumber: string;
    instructions: string;
    qrImage?: string;
  };
  tippingOptions: number[]; // e.g. [5, 10, 15, 20]
}

export type StaffRole = 'Owner' | 'Admin / Manager' | 'Waiter' | 'Kitchen Staff' | 'Cashier' | 'Guest Diner';
