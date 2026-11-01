import fs from 'fs';
import path from 'path';
import {
  DiningTable,
  MenuItem,
  MenuCategory,
  Order,
  PaymentRecord,
  RestaurantSettings,
  TableSession,
  WaiterProfile,
  TipRecord,
  CustomerReview,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Initial luxury seed images generated in Phase 1
const IMG_HERO = '/src/assets/images/hero_dining_interior_1793555391854.jpg';
const IMG_WAGYU = '/src/assets/images/food_signature_wagyu_1793555392859.jpg';
const IMG_PASTA = '/src/assets/images/food_artisan_pasta_1793555393056.jpg';
const IMG_COCKTAIL = '/src/assets/images/food_craft_cocktail_1793555393550.jpg';
const IMG_DESSERT = '/src/assets/images/food_patisserie_dessert_1793555393820.jpg';

interface StoreData {
  settings: RestaurantSettings;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  sessions: TableSession[];
  orders: Order[];
  payments: PaymentRecord[];
  waiters: WaiterProfile[];
  tips: TipRecord[];
  reviews: CustomerReview[];
}

function getInitialStore(): StoreData {
  const settings: RestaurantSettings = {
    name: "L'Aura Modern Dining & Lounge",
    tagline: "Contemporary French & Nordic Gastronomy",
    description: "An immersive culinary sanctuary blending seasonal coastal harvests with avant-garde gastronomy, precision wood-fire techniques, and artisanal mixology.",
    coverImageUrl: IMG_HERO,
    address: "420 St. Honore Boulevard, Upper Terrace, CA 94103",
    phone: "+1 (415) 890-3400",
    email: "concierge@lauradining.com",
    currencySymbol: "$",
    currencyCode: "USD",
    taxRatePercent: 8.5,
    serviceChargePercent: 5.0,
    openingHours: "Tue - Sun: 5:00 PM – 11:30 PM",
    weeklySchedule: [
      { day: "Monday", hours: "Closed for Culinary Lab", isOpen: false },
      { day: "Tuesday", hours: "5:00 PM – 11:00 PM", isOpen: true },
      { day: "Wednesday", hours: "5:00 PM – 11:00 PM", isOpen: true },
      { day: "Thursday", hours: "5:00 PM – 11:30 PM", isOpen: true },
      { day: "Friday", hours: "5:00 PM – 12:00 AM", isOpen: true },
      { day: "Saturday", hours: "4:30 PM – 12:00 AM", isOpen: true },
      { day: "Sunday", hours: "4:30 PM – 10:30 PM", isOpen: true },
    ],
    cuisineTypes: ["Modern French", "Nordic Seafood", "Wood-Fired Steaks", "Artisan Cocktails"],
    facilities: ["Valet Parking", "Sommelier Cellar", "Private Dining Salon", "High-Speed Guest Wi-Fi", "Garden Terrace", "Wheelchair Accessible"],
    qrPaymentDetails: {
      merchantName: "L'Aura Dining Reserve",
      accountNumber: "LAURA-PAY-8820",
      instructions: "Scan the payment QR code using your banking or digital wallet app, then submit the confirmation transaction note for staff verification.",
    },
    tippingOptions: [10, 15, 18, 20, 25],
  };

  const categories: MenuCategory[] = [
    { id: "cat-1", name: "Starters & Crudo", slug: "starters", displayOrder: 1, description: "Delicate marine crudo and botanical amuse-bouche" },
    { id: "cat-2", name: "Artisan Pasta & Seafood", slug: "pasta-seafood", displayOrder: 2, description: "Extruded in-house pasta with day-boat coastal seafood" },
    { id: "cat-3", name: "Wood-Fired Mains", slug: "mains", displayOrder: 3, description: "Dry-aged prime cuts and heritage poultry" },
    { id: "cat-4", name: "Chef's Tasting Signatures", slug: "signatures", displayOrder: 4, description: "Our executive chef's seasonal multi-course creations" },
    { id: "cat-5", name: "Craft Cocktails & Cellar", slug: "drinks", displayOrder: 5, description: "Small-batch botanical spirits and biodynamic wines" },
    { id: "cat-6", name: "Haute Pâtisserie", slug: "desserts", displayOrder: 6, description: "Deconstructed French confections and house sorbets" },
  ];

  const menuItems: MenuItem[] = [
    {
      id: "item-1",
      name: "Miyazaki A5 Wagyu Tenderloin",
      categoryId: "cat-3",
      description: "Charcoal-seared Miyazaki A5 wagyu beef with black truffle potato mousseline, charred baby leeks, and 36-hour bone marrow red wine glaze.",
      price: 94.00,
      originalPrice: 110.00,
      image: IMG_WAGYU,
      rating: 4.95,
      reviewsCount: 142,
      preparationMinutes: 24,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: true,
      isPopular: true,
      dietary: ["Chef Special", "Gluten-Free"],
      ingredients: ["A5 Wagyu Beef", "Black Périgord Truffle", "Yukon Gold Potatoes", "Bordelaise Reduction", "Baby Leeks"],
      allergens: ["Dairy"],
      variants: [
        { id: "v1-1", name: "Medium Rare (Recommended)", price: 0 },
        { id: "v1-2", name: "Rare", price: 0 },
        { id: "v1-3", name: "Medium", price: 0 }
      ],
      addons: [
        { id: "a1-1", name: "Fresh Winter Truffle Shavings (5g)", price: 18.00 },
        { id: "a1-2", name: "Seared Hudson Valley Foie Gras", price: 22.00 }
      ]
    },
    {
      id: "item-2",
      name: "Squid Ink Tagliolini & Poached Lobster",
      categoryId: "cat-2",
      description: "Hand-cut squid ink tagliolini pasta with butter-poached Maine lobster claw, saffron cream emulsion, micro bronze basil, and edible violas.",
      price: 52.00,
      image: IMG_PASTA,
      rating: 4.88,
      reviewsCount: 98,
      preparationMinutes: 18,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: true,
      isPopular: true,
      dietary: ["Chef Special"],
      ingredients: ["Cuttlefish Ink", "00 Durum Semolina", "Maine Lobster", "Iranian Saffron", "Cultured Butter", "Micro Basil"],
      allergens: ["Crustacean", "Gluten", "Dairy", "Eggs"],
      addons: [
        { id: "a2-1", name: "Extra Lobster Tail Medallion", price: 16.00 },
        { id: "a2-2", name: "Osetra Caviar Spoonful (10g)", price: 28.00 }
      ]
    },
    {
      id: "item-3",
      name: "The Smoked Rosemary Old Fashioned",
      categoryId: "cat-5",
      description: "Hand-blended small batch bourbon infused with charred rosemary smoke, single crystal clear ice sphere, demerara syrup, and dehydrated blood orange wheel.",
      price: 24.00,
      image: IMG_COCKTAIL,
      rating: 4.92,
      reviewsCount: 164,
      preparationMinutes: 6,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: true,
      isPopular: true,
      dietary: ["Vegan", "Gluten-Free"],
      ingredients: ["Bourbon Reserve", "Charred Organic Rosemary", "Angostura & Orange Bitters", "Raw Demerara", "Blood Orange"],
      allergens: [],
      variants: [
        { id: "v3-1", name: "Single Barrel Rye Edition", price: 4.00 },
        { id: "v3-2", name: "Classic Bourbon Reserve", price: 0 }
      ]
    },
    {
      id: "item-4",
      name: "Valrhona Ganache Dome & Raspberry Quenelle",
      categoryId: "cat-6",
      description: "Grand cru dark chocolate dome filled with salted caramel praline, edible 24k gold leaf, cold-pressed raspberry coulis, and Madagascar vanilla bean quenelle.",
      price: 26.00,
      originalPrice: 30.00,
      image: IMG_DESSERT,
      rating: 4.97,
      reviewsCount: 89,
      preparationMinutes: 12,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: true,
      isPopular: true,
      dietary: ["Vegetarian"],
      ingredients: ["70% Valrhona Guanaja", "Piedmont Hazelnuts", "Tahitian Vanilla", "Wild Raspberries", "24k Gold Leaf"],
      allergens: ["Dairy", "Tree Nuts", "Eggs", "Gluten"],
      addons: [
        { id: "a4-1", name: "Espresso Affogato Shot", price: 6.00 }
      ]
    },
    {
      id: "item-5",
      name: "Hokkaido Scallop Crudo with Yuzu Kosho",
      categoryId: "cat-1",
      description: "Thinly sliced wild diver scallops, finger lime pearls, white soy ponzu, cold-pressed arbequina olive oil, and crispy shallot crisps.",
      price: 34.00,
      image: IMG_PASTA, // styled fallback image
      rating: 4.85,
      reviewsCount: 63,
      preparationMinutes: 10,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: false,
      isPopular: true,
      dietary: ["Gluten-Free", "Halal"],
      ingredients: ["Hokkaido Diver Scallops", "Finger Lime", "Yuzu Kosho", "Arbequina Oil", "Chervil"],
      allergens: ["Molluscs", "Soy"],
    },
    {
      id: "item-6",
      name: "Wood-Fired Duck Breast with Blood Plum",
      categoryId: "cat-3",
      description: "Slow-roasted Liberty Farms duck breast with crispy honey-lavender skin, compressed blood plums, celeriac silk, and spiced duck jus.",
      price: 48.00,
      image: IMG_WAGYU,
      rating: 4.89,
      reviewsCount: 77,
      preparationMinutes: 22,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: false,
      isPopular: false,
      dietary: ["Gluten-Free", "Halal"],
      ingredients: ["Liberty Duck Breast", "Blood Plum", "Wild Honey", "Lavender", "Celeriac"],
      allergens: ["Dairy"],
    },
    {
      id: "item-7",
      name: "Elysian Botanical Garden Highball",
      categoryId: "cat-5",
      description: "Artisanal London dry gin, clarified green apple cordial, elderflower liqueur, sparkling artisanal tonic, and botanical cucumber ribbon.",
      price: 21.00,
      image: IMG_COCKTAIL,
      rating: 4.82,
      reviewsCount: 54,
      preparationMinutes: 5,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: false,
      isPopular: false,
      dietary: ["Vegan", "Gluten-Free"],
      ingredients: ["Artisan Gin", "Elderflower", "Clarified Green Apple", "Fever-Tree Tonic"],
      allergens: [],
    },
    {
      id: "item-8",
      name: "Truffle & Morel Mushroom Agnolotti",
      categoryId: "cat-2",
      description: "Delicate pasta pillows filled with caramelized leeks and mascarpone, tossed with pan-roasted French morels and brown butter parmesan velouté.",
      price: 44.00,
      image: IMG_PASTA,
      rating: 4.91,
      reviewsCount: 88,
      preparationMinutes: 16,
      isAvailable: true,
      isSoldOut: false,
      isFeatured: false,
      isPopular: true,
      dietary: ["Vegetarian"],
      ingredients: ["Morel Mushrooms", "Mascarpone", "Brown Butter", "Parmigiano Reggiano 24-Mo", "Fresh Sage"],
      allergens: ["Dairy", "Gluten", "Eggs"],
    }
  ];

  const waiters: WaiterProfile[] = [
    {
      id: "w-1",
      employeeId: "EMP-104",
      name: "Julian Vance",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "Head Chef de Rang & Service Lead",
      phone: "+1 (415) 890-3411",
      email: "julian.v@lauradining.com",
      assignedTables: ["01", "02", "03"],
      isActive: true,
      totalTips: 685.00,
      rating: 4.96,
      ratingCount: 114
    },
    {
      id: "w-2",
      employeeId: "EMP-108",
      name: "Elena Rostova",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      role: "Lead Sommelier & Floor Manager",
      phone: "+1 (415) 890-3412",
      email: "elena.r@lauradining.com",
      assignedTables: ["04", "05", "06"],
      isActive: true,
      totalTips: 820.00,
      rating: 4.98,
      ratingCount: 148
    },
    {
      id: "w-3",
      employeeId: "EMP-112",
      name: "Marcus Chen",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      role: "Senior Hospitality Associate",
      phone: "+1 (415) 890-3413",
      email: "marcus.c@lauradining.com",
      assignedTables: ["07", "08"],
      isActive: true,
      totalTips: 540.00,
      rating: 4.89,
      ratingCount: 92
    }
  ];

  const tables: DiningTable[] = [
    { id: "tbl-1", tableNumber: "01", capacity: 2, section: "Window Alcove", status: "Occupied", assignedWaiterId: "w-1", currentSessionId: "sess-01", qrCodeUrl: "/?table=01&token=TOK_TBL_01_SEC", qrSecretToken: "TOK_TBL_01_SEC" },
    { id: "tbl-2", tableNumber: "02", capacity: 4, section: "Main Dining Room", status: "Preparing", assignedWaiterId: "w-1", currentSessionId: "sess-02", qrCodeUrl: "/?table=02&token=TOK_TBL_02_SEC", qrSecretToken: "TOK_TBL_02_SEC" },
    { id: "tbl-3", tableNumber: "03", capacity: 4, section: "Main Dining Room", status: "Available", assignedWaiterId: "w-1", qrCodeUrl: "/?table=03&token=TOK_TBL_03_SEC", qrSecretToken: "TOK_TBL_03_SEC" },
    { id: "tbl-4", tableNumber: "04", capacity: 6, section: "Wine Cellar Salon", status: "Served", assignedWaiterId: "w-2", currentSessionId: "sess-04", qrCodeUrl: "/?table=04&token=TOK_TBL_04_SEC", qrSecretToken: "TOK_TBL_04_SEC" },
    { id: "tbl-5", tableNumber: "05", capacity: 2, section: "Wine Cellar Salon", status: "Available", assignedWaiterId: "w-2", qrCodeUrl: "/?table=05&token=TOK_TBL_05_SEC", qrSecretToken: "TOK_TBL_05_SEC" },
    { id: "tbl-6", tableNumber: "06", capacity: 8, section: "Private Alcove", status: "Awaiting Payment", assignedWaiterId: "w-2", currentSessionId: "sess-06", qrCodeUrl: "/?table=06&token=TOK_TBL_06_SEC", qrSecretToken: "TOK_TBL_06_SEC" },
    { id: "tbl-7", tableNumber: "07", capacity: 4, section: "Garden Terrace", status: "Available", assignedWaiterId: "w-3", qrCodeUrl: "/?table=07&token=TOK_TBL_07_SEC", qrSecretToken: "TOK_TBL_07_SEC" },
    { id: "tbl-8", tableNumber: "08", capacity: 2, section: "Garden Terrace", status: "Cleaning", assignedWaiterId: "w-3", qrCodeUrl: "/?table=08&token=TOK_TBL_08_SEC", qrSecretToken: "TOK_TBL_08_SEC" },
  ];

  const sessions: TableSession[] = [
    {
      id: "sess-01",
      tableNumber: "01",
      token: "TOK_TBL_01_SEC",
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      activeOrderIds: ["ord-101"],
      subtotalAccumulated: 170.00,
      taxAccumulated: 14.45,
      serviceChargeAccumulated: 8.50,
      totalAccumulated: 192.95,
      paymentStatus: "unpaid"
    },
    {
      id: "sess-02",
      tableNumber: "02",
      token: "TOK_TBL_02_SEC",
      startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      activeOrderIds: ["ord-102"],
      subtotalAccumulated: 190.00,
      taxAccumulated: 16.15,
      serviceChargeAccumulated: 9.50,
      totalAccumulated: 215.65,
      paymentStatus: "unpaid"
    },
    {
      id: "sess-04",
      tableNumber: "04",
      token: "TOK_TBL_04_SEC",
      startedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      activeOrderIds: ["ord-104"],
      subtotalAccumulated: 312.00,
      taxAccumulated: 26.52,
      serviceChargeAccumulated: 15.60,
      totalAccumulated: 354.12,
      paymentStatus: "unpaid"
    },
    {
      id: "sess-06",
      tableNumber: "06",
      token: "TOK_TBL_06_SEC",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      activeOrderIds: ["ord-106"],
      subtotalAccumulated: 430.00,
      taxAccumulated: 36.55,
      serviceChargeAccumulated: 21.50,
      totalAccumulated: 488.05,
      paymentStatus: "pending_verification"
    }
  ];

  const orders: Order[] = [
    {
      id: "ord-101",
      orderNumber: "ORD-8801",
      tableNumber: "01",
      sessionId: "sess-01",
      waiterId: "w-1",
      items: [
        {
          id: "oi-1",
          menuItemId: "item-1",
          name: "Miyazaki A5 Wagyu Tenderloin",
          quantity: 1,
          unitPrice: 94.00,
          totalPrice: 112.00, // with addon
          customization: {
            selectedVariant: { id: "v1-1", name: "Medium Rare (Recommended)", price: 0 },
            selectedAddons: [{ id: "a1-1", name: "Fresh Winter Truffle Shavings (5g)", price: 18.00 }],
            specialInstructions: "Cut into sharing pieces if possible please."
          },
          kdsStatus: "Served"
        },
        {
          id: "oi-2",
          menuItemId: "item-3",
          name: "The Smoked Rosemary Old Fashioned",
          quantity: 2,
          unitPrice: 24.00,
          totalPrice: 48.00,
          kdsStatus: "Served"
        }
      ],
      subtotal: 160.00,
      tax: 13.60,
      serviceCharge: 8.00,
      discount: 0,
      total: 181.60,
      status: "Served",
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      estimatedMinutes: 20
    },
    {
      id: "ord-102",
      orderNumber: "ORD-8802",
      tableNumber: "02",
      sessionId: "sess-02",
      waiterId: "w-1",
      items: [
        {
          id: "oi-3",
          menuItemId: "item-2",
          name: "Squid Ink Tagliolini & Poached Lobster",
          quantity: 2,
          unitPrice: 52.00,
          totalPrice: 104.00,
          customization: {
            specialInstructions: "One dish with extra cracked black pepper."
          },
          kdsStatus: "Preparing"
        },
        {
          id: "oi-4",
          menuItemId: "item-1",
          name: "Miyazaki A5 Wagyu Tenderloin",
          quantity: 1,
          unitPrice: 94.00,
          totalPrice: 94.00,
          customization: {
            selectedVariant: { id: "v1-1", name: "Medium Rare (Recommended)", price: 0 }
          },
          kdsStatus: "Preparing"
        }
      ],
      subtotal: 198.00,
      tax: 16.83,
      serviceCharge: 9.90,
      discount: 0,
      total: 224.73,
      status: "Preparing",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimatedMinutes: 25
    },
    {
      id: "ord-104",
      orderNumber: "ORD-8804",
      tableNumber: "04",
      sessionId: "sess-04",
      waiterId: "w-2",
      items: [
        {
          id: "oi-5",
          menuItemId: "item-1",
          name: "Miyazaki A5 Wagyu Tenderloin",
          quantity: 2,
          unitPrice: 94.00,
          totalPrice: 188.00,
          kdsStatus: "Served"
        },
        {
          id: "oi-6",
          menuItemId: "item-4",
          name: "Valrhona Ganache Dome & Raspberry Quenelle",
          quantity: 2,
          unitPrice: 26.00,
          totalPrice: 52.00,
          kdsStatus: "Preparing"
        }
      ],
      subtotal: 240.00,
      tax: 20.40,
      serviceCharge: 12.00,
      discount: 0,
      total: 272.40,
      status: "Preparing",
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      estimatedMinutes: 15
    },
    {
      id: "ord-106",
      orderNumber: "ORD-8806",
      tableNumber: "06",
      sessionId: "sess-06",
      waiterId: "w-2",
      items: [
        {
          id: "oi-7",
          menuItemId: "item-1",
          name: "Miyazaki A5 Wagyu Tenderloin",
          quantity: 3,
          unitPrice: 94.00,
          totalPrice: 282.00,
          kdsStatus: "Served"
        },
        {
          id: "oi-8",
          menuItemId: "item-2",
          name: "Squid Ink Tagliolini & Poached Lobster",
          quantity: 2,
          unitPrice: 52.00,
          totalPrice: 104.00,
          kdsStatus: "Served"
        }
      ],
      subtotal: 386.00,
      tax: 32.81,
      serviceCharge: 19.30,
      discount: 0,
      total: 438.11,
      status: "Ready to Serve",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      estimatedMinutes: 20
    }
  ];

  const payments: PaymentRecord[] = [
    {
      id: "pay-501",
      orderId: "ord-106",
      sessionId: "sess-06",
      tableNumber: "06",
      method: "QR Code Payment",
      subtotal: 386.00,
      tax: 32.81,
      serviceCharge: 19.30,
      tipAmount: 60.00,
      totalAmount: 498.11,
      status: "pending_verification",
      transactionReference: "TXN-BANK-99410",
      receiptNote: "Customer submitted QR payment screenshot via mobile wallet.",
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
    },
    {
      id: "pay-499",
      sessionId: "sess-prev-03",
      tableNumber: "03",
      method: "Online Card",
      subtotal: 210.00,
      tax: 17.85,
      serviceCharge: 10.50,
      tipAmount: 40.00,
      totalAmount: 278.35,
      status: "verified",
      transactionReference: "AUTH-STRIPE-4421",
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      verifiedAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      verifiedBy: "Elena Rostova (Manager)"
    }
  ];

  const tips: TipRecord[] = [
    {
      id: "tip-01",
      tableNumber: "03",
      sessionId: "sess-prev-03",
      waiterId: "w-1",
      waiterName: "Julian Vance",
      amount: 40.00,
      percentage: 19,
      paymentMethod: "Online Card",
      status: "paid",
      createdAt: new Date(Date.now() - 105 * 60 * 1000).toISOString()
    },
    {
      id: "tip-02",
      tableNumber: "06",
      sessionId: "sess-06",
      orderId: "ord-106",
      waiterId: "w-2",
      waiterName: "Elena Rostova",
      amount: 60.00,
      percentage: 15,
      paymentMethod: "QR Code Payment",
      status: "pending",
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
    }
  ];

  const reviews: CustomerReview[] = [
    {
      id: "rev-01",
      customerName: "Audrey Kensington",
      tableNumber: "04",
      overallRating: 5,
      foodRating: 5,
      serviceRating: 5,
      cleanlinessRating: 5,
      valueRating: 5,
      comment: "Unquestionably the best dining experience in the city. The A5 Miyazaki Wagyu melts immediately, and Elena's wine pairing was transcendent. The table QR ordering was effortless.",
      photoUrl: IMG_WAGYU,
      isVerifiedDiner: true,
      isModerated: false,
      adminReply: "Thank you immensely Audrey. We look forward to welcoming you back for our autumn tasting season.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev-02",
      customerName: "Dr. Jonathan Pierce",
      tableNumber: "02",
      overallRating: 5,
      foodRating: 5,
      serviceRating: 4.8,
      cleanlinessRating: 5,
      valueRating: 4.5,
      comment: "The squid ink tagliolini with lobster is art on a plate. Loved being able to browse allergen details and submit our order directly from our table without waiting.",
      photoUrl: IMG_PASTA,
      isVerifiedDiner: true,
      isModerated: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev-03",
      customerName: "Claire DeWitt",
      tableNumber: "01",
      overallRating: 5,
      foodRating: 5,
      serviceRating: 5,
      cleanlinessRating: 5,
      valueRating: 5,
      comment: "The smoked rosemary cocktail presentation was hypnotic. Being able to tip Julian directly on the payment screen made closing our bill smooth and elegant.",
      photoUrl: IMG_COCKTAIL,
      isVerifiedDiner: true,
      isModerated: false,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    settings,
    categories,
    menuItems,
    tables,
    sessions,
    orders,
    payments,
    waiters,
    tips,
    reviews
  };
}

class Store {
  private data: StoreData;

  constructor() {
    this.data = this.load();
  }

  private load(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read persistent store file, using initial memory seed:", err);
    }
    const initial = getInitialStore();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to write store data:", err);
    }
  }

  public get(): StoreData {
    return this.data;
  }

  public commit() {
    this.saveData(this.data);
  }

  public resetToDefault() {
    this.data = getInitialStore();
    this.commit();
    return this.data;
  }
}

export const db = new Store();
