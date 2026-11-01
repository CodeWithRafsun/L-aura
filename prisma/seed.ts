import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const IMG_HERO = '/src/assets/images/hero_dining_interior_1793555391854.jpg';
const IMG_WAGYU = '/src/assets/images/food_signature_wagyu_1793555392859.jpg';
const IMG_PASTA = '/src/assets/images/food_artisan_pasta_1793555393056.jpg';
const IMG_COCKTAIL = '/src/assets/images/food_craft_cocktail_1793555393550.jpg';
const IMG_DESSERT = '/src/assets/images/food_patisserie_dessert_1793555393820.jpg';

export async function seedPrismaDatabase() {
  console.log('Seeding Prisma database...');

  // Check if already seeded
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Prisma database already contains data.');
    return;
  }

  // 1. Create Staff Users with BCRYPT hashed passwords
  const passwordHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const chefHash = await bcrypt.hash('chef123', 10);
  const waiterHash = await bcrypt.hash('waiter123', 10);
  const cashierHash = await bcrypt.hash('cashier123', 10);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@laura.com',
        name: 'Laurent Rousseau',
        passwordHash,
        role: 'Owner',
        employeeId: 'EMP-001',
      },
      {
        email: 'manager@laura.com',
        name: 'Elena Rostova',
        passwordHash: managerHash,
        role: 'Admin / Manager',
        employeeId: 'EMP-108',
      },
      {
        email: 'chef@laura.com',
        name: 'Chef Antoine Mercier',
        passwordHash: chefHash,
        role: 'Kitchen Staff',
        employeeId: 'EMP-005',
      },
      {
        email: 'waiter@laura.com',
        name: 'Julian Vance',
        passwordHash: waiterHash,
        role: 'Waiter',
        employeeId: 'EMP-104',
      },
      {
        email: 'cashier@laura.com',
        name: 'Marcus Chen',
        passwordHash: cashierHash,
        role: 'Cashier',
        employeeId: 'EMP-112',
      },
    ],
  });

  // 2. Create Restaurant Profile
  await prisma.restaurant.create({
    data: {
      id: 'rest-1',
      name: "L'Aura Modern Dining & Lounge",
      tagline: 'Contemporary French & Nordic Gastronomy',
      description:
        'An immersive culinary sanctuary blending seasonal coastal harvests with avant-garde gastronomy, precision wood-fire techniques, and artisanal mixology.',
      coverImageUrl: IMG_HERO,
      address: '420 St. Honore Boulevard, Upper Terrace, CA 94103',
      phone: '+1 (415) 890-3400',
      email: 'concierge@lauradining.com',
      currencySymbol: '$',
      currencyCode: 'USD',
      taxRatePercent: 8.5,
      serviceChargePercent: 5.0,
      openingHours: 'Tue - Sun: 5:00 PM – 11:30 PM',
      weeklyScheduleJson: JSON.stringify([
        { day: 'Monday', hours: 'Closed for Culinary Lab', isOpen: false },
        { day: 'Tuesday', hours: '5:00 PM – 11:00 PM', isOpen: true },
        { day: 'Wednesday', hours: '5:00 PM – 11:00 PM', isOpen: true },
        { day: 'Thursday', hours: '5:00 PM – 11:30 PM', isOpen: true },
        { day: 'Friday', hours: '5:00 PM – 12:00 AM', isOpen: true },
        { day: 'Saturday', hours: '4:30 PM – 12:00 AM', isOpen: true },
        { day: 'Sunday', hours: '4:30 PM – 10:30 PM', isOpen: true },
      ]),
      cuisineTypesJson: JSON.stringify([
        'Modern French',
        'Nordic Seafood',
        'Wood-Fired Steaks',
        'Artisan Cocktails',
      ]),
      facilitiesJson: JSON.stringify([
        'Valet Parking',
        'Sommelier Cellar',
        'Private Dining Salon',
        'High-Speed Guest Wi-Fi',
        'Garden Terrace',
        'Wheelchair Accessible',
      ]),
      qrPaymentJson: JSON.stringify({
        merchantName: "L'Aura Dining Reserve",
        accountNumber: 'LAURA-PAY-8820',
        instructions:
          'Scan the payment QR code using your banking or digital wallet app, then submit the confirmation transaction note for staff verification.',
      }),
      tippingOptionsJson: JSON.stringify([10, 15, 18, 20, 25]),
    },
  });

  // 3. Create Menu Categories
  const cat1 = await prisma.menuCategory.create({
    data: { id: 'cat-1', name: 'Starters & Crudo', slug: 'starters', displayOrder: 1, description: 'Delicate marine crudo and botanical amuse-bouche' }
  });
  const cat2 = await prisma.menuCategory.create({
    data: { id: 'cat-2', name: 'Artisan Pasta & Seafood', slug: 'pasta-seafood', displayOrder: 2, description: 'Extruded in-house pasta with day-boat coastal seafood' }
  });
  const cat3 = await prisma.menuCategory.create({
    data: { id: 'cat-3', name: 'Wood-Fired Mains', slug: 'mains', displayOrder: 3, description: 'Dry-aged prime cuts and heritage poultry' }
  });
  const cat4 = await prisma.menuCategory.create({
    data: { id: 'cat-4', name: "Chef's Tasting Signatures", slug: 'signatures', displayOrder: 4, description: "Our executive chef's seasonal multi-course creations" }
  });
  const cat5 = await prisma.menuCategory.create({
    data: { id: 'cat-5', name: 'Craft Cocktails & Cellar', slug: 'drinks', displayOrder: 5, description: 'Small-batch botanical spirits and biodynamic wines' }
  });
  const cat6 = await prisma.menuCategory.create({
    data: { id: 'cat-6', name: 'Haute Pâtisserie', slug: 'desserts', displayOrder: 6, description: 'Deconstructed French confections and house sorbets' }
  });

  // 4. Create Menu Items
  await prisma.menuItem.createMany({
    data: [
      {
        id: 'item-1',
        name: 'Miyazaki A5 Wagyu Tenderloin',
        categoryId: cat3.id,
        description: 'Charcoal-seared Miyazaki A5 wagyu beef with black truffle potato mousseline, charred baby leeks, and 36-hour bone marrow red wine glaze.',
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
        dietaryJson: JSON.stringify(['Chef Special', 'Gluten-Free']),
        ingredientsJson: JSON.stringify(['A5 Wagyu Beef', 'Black Périgord Truffle', 'Yukon Gold Potatoes', 'Bordelaise Reduction', 'Baby Leeks']),
        allergensJson: JSON.stringify(['Dairy']),
        variantsJson: JSON.stringify([
          { id: 'v1-1', name: 'Medium Rare (Recommended)', price: 0 },
          { id: 'v1-2', name: 'Rare', price: 0 },
          { id: 'v1-3', name: 'Medium', price: 0 }
        ]),
        addonsJson: JSON.stringify([
          { id: 'a1-1', name: 'Fresh Winter Truffle Shavings (5g)', price: 18.00 },
          { id: 'a1-2', name: 'Seared Hudson Valley Foie Gras', price: 22.00 }
        ])
      },
      {
        id: 'item-2',
        name: 'Squid Ink Tagliolini & Poached Lobster',
        categoryId: cat2.id,
        description: 'Hand-cut squid ink tagliolini pasta with butter-poached Maine lobster claw, saffron cream emulsion, micro bronze basil, and edible violas.',
        price: 52.00,
        image: IMG_PASTA,
        rating: 4.88,
        reviewsCount: 98,
        preparationMinutes: 18,
        isAvailable: true,
        isSoldOut: false,
        isFeatured: true,
        isPopular: true,
        dietaryJson: JSON.stringify(['Chef Special']),
        ingredientsJson: JSON.stringify(['Cuttlefish Ink', '00 Durum Semolina', 'Maine Lobster', 'Iranian Saffron', 'Cultured Butter', 'Micro Basil']),
        allergensJson: JSON.stringify(['Crustacean', 'Gluten', 'Dairy', 'Eggs']),
        addonsJson: JSON.stringify([
          { id: 'a2-1', name: 'Extra Lobster Tail Medallion', price: 16.00 },
          { id: 'a2-2', name: 'Osetra Caviar Spoonful (10g)', price: 28.00 }
        ])
      },
      {
        id: 'item-3',
        name: 'The Smoked Rosemary Old Fashioned',
        categoryId: cat5.id,
        description: 'Hand-blended small batch bourbon infused with charred rosemary smoke, single crystal clear ice sphere, demerara syrup, and dehydrated blood orange wheel.',
        price: 24.00,
        image: IMG_COCKTAIL,
        rating: 4.92,
        reviewsCount: 164,
        preparationMinutes: 6,
        isAvailable: true,
        isSoldOut: false,
        isFeatured: true,
        isPopular: true,
        dietaryJson: JSON.stringify(['Vegan', 'Gluten-Free']),
        ingredientsJson: JSON.stringify(['Bourbon Reserve', 'Charred Organic Rosemary', 'Angostura & Orange Bitters', 'Raw Demerara', 'Blood Orange']),
        allergensJson: JSON.stringify([]),
        variantsJson: JSON.stringify([
          { id: 'v3-1', name: 'Single Barrel Rye Edition', price: 4.00 },
          { id: 'v3-2', name: 'Classic Bourbon Reserve', price: 0 }
        ])
      },
      {
        id: 'item-4',
        name: 'Valrhona Ganache Dome & Raspberry Quenelle',
        categoryId: cat6.id,
        description: 'Grand cru dark chocolate dome filled with salted caramel praline, edible 24k gold leaf, cold-pressed raspberry coulis, and Madagascar vanilla bean quenelle.',
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
        dietaryJson: JSON.stringify(['Vegetarian']),
        ingredientsJson: JSON.stringify(['70% Valrhona Guanaja', 'Piedmont Hazelnuts', 'Tahitian Vanilla', 'Wild Raspberries', '24k Gold Leaf']),
        allergensJson: JSON.stringify(['Dairy', 'Tree Nuts', 'Eggs', 'Gluten']),
        addonsJson: JSON.stringify([
          { id: 'a4-1', name: 'Espresso Affogato Shot', price: 6.00 }
        ])
      },
      {
        id: 'item-5',
        name: 'Hokkaido Scallop Crudo with Yuzu Kosho',
        categoryId: cat1.id,
        description: 'Thinly sliced wild diver scallops, finger lime pearls, white soy ponzu, cold-pressed arbequina olive oil, and crispy shallot crisps.',
        price: 34.00,
        image: IMG_PASTA,
        rating: 4.85,
        reviewsCount: 63,
        preparationMinutes: 10,
        isAvailable: true,
        isSoldOut: false,
        isFeatured: false,
        isPopular: true,
        dietaryJson: JSON.stringify(['Gluten-Free', 'Halal']),
        ingredientsJson: JSON.stringify(['Hokkaido Diver Scallops', 'Finger Lime', 'Yuzu Kosho', 'Arbequina Oil', 'Chervil']),
        allergensJson: JSON.stringify(['Molluscs', 'Soy']),
      },
      {
        id: 'item-6',
        name: 'Wood-Fired Duck Breast with Blood Plum',
        categoryId: cat3.id,
        description: 'Slow-roasted Liberty Farms duck breast with crispy honey-lavender skin, compressed blood plums, celeriac silk, and spiced duck jus.',
        price: 48.00,
        image: IMG_WAGYU,
        rating: 4.89,
        reviewsCount: 77,
        preparationMinutes: 22,
        isAvailable: true,
        isSoldOut: false,
        isFeatured: false,
        isPopular: false,
        dietaryJson: JSON.stringify(['Gluten-Free', 'Halal']),
        ingredientsJson: JSON.stringify(['Liberty Duck Breast', 'Blood Plum', 'Wild Honey', 'Lavender', 'Celeriac']),
        allergensJson: JSON.stringify(['Dairy']),
      },
    ]
  });

  // 5. Create Waiter Profiles
  const w1 = await prisma.waiterProfile.create({
    data: {
      id: 'w-1',
      employeeId: 'EMP-104',
      name: 'Julian Vance',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'Head Chef de Rang & Service Lead',
      phone: '+1 (415) 890-3411',
      email: 'julian.v@lauradining.com',
      assignedTablesJson: JSON.stringify(['01', '02', '03']),
      isActive: true,
      totalTips: 685.00,
      rating: 4.96,
      ratingCount: 114
    }
  });

  const w2 = await prisma.waiterProfile.create({
    data: {
      id: 'w-2',
      employeeId: 'EMP-108',
      name: 'Elena Rostova',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      role: 'Lead Sommelier & Floor Manager',
      phone: '+1 (415) 890-3412',
      email: 'elena.r@lauradining.com',
      assignedTablesJson: JSON.stringify(['04', '05', '06']),
      isActive: true,
      totalTips: 820.00,
      rating: 4.98,
      ratingCount: 148
    }
  });

  await prisma.waiterProfile.create({
    data: {
      id: 'w-3',
      employeeId: 'EMP-112',
      name: 'Marcus Chen',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'Senior Hospitality Associate',
      phone: '+1 (415) 890-3413',
      email: 'marcus.c@lauradining.com',
      assignedTablesJson: JSON.stringify(['07', '08']),
      isActive: true,
      totalTips: 540.00,
      rating: 4.89,
      ratingCount: 92
    }
  });

  // 6. Create Dining Tables
  await prisma.diningTable.createMany({
    data: [
      { id: 'tbl-1', tableNumber: '01', capacity: 2, section: 'Window Alcove', status: 'Occupied', assignedWaiterId: 'w-1', currentSessionId: 'sess-01', qrCodeUrl: '/?table=01&token=TOK_TBL_01_SEC', qrSecretToken: 'TOK_TBL_01_SEC' },
      { id: 'tbl-2', tableNumber: '02', capacity: 4, section: 'Main Dining Room', status: 'Preparing', assignedWaiterId: 'w-1', currentSessionId: 'sess-02', qrCodeUrl: '/?table=02&token=TOK_TBL_02_SEC', qrSecretToken: 'TOK_TBL_02_SEC' },
      { id: 'tbl-3', tableNumber: '03', capacity: 4, section: 'Main Dining Room', status: 'Available', assignedWaiterId: 'w-1', qrCodeUrl: '/?table=03&token=TOK_TBL_03_SEC', qrSecretToken: 'TOK_TBL_03_SEC' },
      { id: 'tbl-4', tableNumber: '04', capacity: 6, section: 'Wine Cellar Salon', status: 'Served', assignedWaiterId: 'w-2', currentSessionId: 'sess-04', qrCodeUrl: '/?table=04&token=TOK_TBL_04_SEC', qrSecretToken: 'TOK_TBL_04_SEC' },
      { id: 'tbl-5', tableNumber: '05', capacity: 2, section: 'Wine Cellar Salon', status: 'Available', assignedWaiterId: 'w-2', qrCodeUrl: '/?table=05&token=TOK_TBL_05_SEC', qrSecretToken: 'TOK_TBL_05_SEC' },
      { id: 'tbl-6', tableNumber: '06', capacity: 8, section: 'Private Alcove', status: 'Awaiting Payment', assignedWaiterId: 'w-2', currentSessionId: 'sess-06', qrCodeUrl: '/?table=06&token=TOK_TBL_06_SEC', qrSecretToken: 'TOK_TBL_06_SEC' },
      { id: 'tbl-7', tableNumber: '07', capacity: 4, section: 'Garden Terrace', status: 'Available', assignedWaiterId: 'w-3', qrCodeUrl: '/?table=07&token=TOK_TBL_07_SEC', qrSecretToken: 'TOK_TBL_07_SEC' },
      { id: 'tbl-8', tableNumber: '08', capacity: 2, section: 'Garden Terrace', status: 'Cleaning', assignedWaiterId: 'w-3', qrCodeUrl: '/?table=08&token=TOK_TBL_08_SEC', qrSecretToken: 'TOK_TBL_08_SEC' },
    ]
  });

  // 7. Create Table Sessions
  const sess1 = await prisma.tableSession.create({
    data: {
      id: 'sess-01',
      tableNumber: '01',
      token: 'TOK_TBL_01_SEC',
      subtotalAccumulated: 170.00,
      taxAccumulated: 14.45,
      serviceChargeAccumulated: 8.50,
      totalAccumulated: 192.95,
      paymentStatus: 'unpaid'
    }
  });

  const sess2 = await prisma.tableSession.create({
    data: {
      id: 'sess-02',
      tableNumber: '02',
      token: 'TOK_TBL_02_SEC',
      subtotalAccumulated: 198.00,
      taxAccumulated: 16.83,
      serviceChargeAccumulated: 9.90,
      totalAccumulated: 224.73,
      paymentStatus: 'unpaid'
    }
  });

  const sess6 = await prisma.tableSession.create({
    data: {
      id: 'sess-06',
      tableNumber: '06',
      token: 'TOK_TBL_06_SEC',
      subtotalAccumulated: 386.00,
      taxAccumulated: 32.81,
      serviceChargeAccumulated: 19.30,
      totalAccumulated: 438.11,
      paymentStatus: 'pending_verification'
    }
  });

  // 8. Create Orders
  await prisma.order.create({
    data: {
      id: 'ord-101',
      orderNumber: 'ORD-8801',
      tableNumber: '01',
      sessionId: sess1.id,
      waiterId: 'w-1',
      subtotal: 160.00,
      tax: 13.60,
      serviceCharge: 8.00,
      discount: 0,
      total: 181.60,
      status: 'Served',
      items: {
        create: [
          {
            menuItemId: 'item-1',
            name: 'Miyazaki A5 Wagyu Tenderloin',
            quantity: 1,
            unitPrice: 112.00,
            totalPrice: 112.00,
            kdsStatus: 'Served'
          },
          {
            menuItemId: 'item-3',
            name: 'The Smoked Rosemary Old Fashioned',
            quantity: 2,
            unitPrice: 24.00,
            totalPrice: 48.00,
            kdsStatus: 'Served'
          }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-102',
      orderNumber: 'ORD-8802',
      tableNumber: '02',
      sessionId: sess2.id,
      waiterId: 'w-1',
      subtotal: 198.00,
      tax: 16.83,
      serviceCharge: 9.90,
      discount: 0,
      total: 224.73,
      status: 'Preparing',
      items: {
        create: [
          {
            menuItemId: 'item-2',
            name: 'Squid Ink Tagliolini & Poached Lobster',
            quantity: 2,
            unitPrice: 52.00,
            totalPrice: 104.00,
            kdsStatus: 'Preparing'
          },
          {
            menuItemId: 'item-1',
            name: 'Miyazaki A5 Wagyu Tenderloin',
            quantity: 1,
            unitPrice: 94.00,
            totalPrice: 94.00,
            kdsStatus: 'Preparing'
          }
        ]
      }
    }
  });

  // 9. Create Payments
  await prisma.payment.create({
    data: {
      id: 'pay-501',
      sessionId: sess6.id,
      tableNumber: '06',
      method: 'QR Code Payment',
      subtotal: 386.00,
      tax: 32.81,
      serviceCharge: 19.30,
      tipAmount: 60.00,
      totalAmount: 498.11,
      status: 'pending_verification',
      transactionReference: 'TXN-BANK-99410',
      receiptNote: 'Customer submitted QR payment screenshot via mobile wallet.'
    }
  });

  // 10. Create Tips
  await prisma.tip.create({
    data: {
      id: 'tip-01',
      tableNumber: '03',
      sessionId: 'sess-prev-03',
      waiterId: w1.id,
      waiterName: w1.name,
      amount: 40.00,
      percentage: 19,
      paymentMethod: 'Online Card',
      status: 'paid'
    }
  });

  await prisma.tip.create({
    data: {
      id: 'tip-02',
      tableNumber: '06',
      sessionId: sess6.id,
      waiterId: w2.id,
      waiterName: w2.name,
      amount: 60.00,
      percentage: 15,
      paymentMethod: 'QR Code Payment',
      status: 'pending'
    }
  });

  // 11. Create Customer Reviews
  await prisma.customerReview.createMany({
    data: [
      {
        id: 'rev-01',
        customerName: 'Audrey Kensington',
        tableNumber: '04',
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        cleanlinessRating: 5,
        valueRating: 5,
        comment: 'Unquestionably the best dining experience in the city. The A5 Miyazaki Wagyu melts immediately, and Elena’s wine pairing was transcendent. The table QR ordering was effortless.',
        photoUrl: IMG_WAGYU,
        isVerifiedDiner: true,
        isModerated: false,
        adminReply: 'Thank you immensely Audrey. We look forward to welcoming you back for our autumn tasting season.'
      },
      {
        id: 'rev-02',
        customerName: 'Dr. Jonathan Pierce',
        tableNumber: '02',
        overallRating: 5,
        foodRating: 5,
        serviceRating: 4.8,
        cleanlinessRating: 5,
        valueRating: 4.5,
        comment: 'The squid ink tagliolini with lobster is art on a plate. Loved being able to browse allergen details and submit our order directly from our table without waiting.',
        photoUrl: IMG_PASTA,
        isVerifiedDiner: true,
        isModerated: false
      },
      {
        id: 'rev-03',
        customerName: 'Claire DeWitt',
        tableNumber: '01',
        overallRating: 5,
        foodRating: 5,
        serviceRating: 5,
        cleanlinessRating: 5,
        valueRating: 5,
        comment: 'The smoked rosemary cocktail presentation was hypnotic. Being able to tip Julian directly on the payment screen made closing our bill smooth and elegant.',
        photoUrl: IMG_COCKTAIL,
        isVerifiedDiner: true,
        isModerated: false
      }
    ]
  });

  console.log('Prisma database successfully populated with luxury seed data and admin auth accounts.');
}
