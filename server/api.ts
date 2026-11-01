import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma.ts';

export const apiRouter = Router();

// In-memory token session map
const activeSessions = new Map<string, { userId: string; email: string; role: string; name: string }>();

// Auth Helper Middleware
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return activeSessions.get(token) || null;
}

// ==========================================
// 0. TESTING ADMIN AUTH
// ==========================================
apiRouter.get('/auth/testing-accounts', (_req: Request, res: Response) => {
  res.json([
    { role: 'Owner', email: 'admin@laura.com', password: 'admin123', name: 'Laurent Rousseau (Executive Chef & Owner)' },
    { role: 'Admin / Manager', email: 'manager@laura.com', password: 'manager123', name: 'Elena Rostova (Floor Manager)' },
    { role: 'Kitchen Staff', email: 'chef@laura.com', password: 'chef123', name: 'Antoine Mercier (Sous Chef)' },
    { role: 'Waiter', email: 'waiter@laura.com', password: 'waiter123', name: 'Julian Vance (Chef de Rang)' },
    { role: 'Cashier', email: 'cashier@laura.com', password: 'cashier123', name: 'Marcus Chen (Cashier & Billing)' },
  ]);
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = `AURA_AUTH_${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(token, {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const session = getAuthUser(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  res.json({ user: session });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// ==========================================
// 1. RESTAURANT SETTINGS (PRISMA)
// ==========================================
apiRouter.get(['/restaurant', '/settings'], async (_req: Request, res: Response) => {
  try {
    const rest = await prisma.restaurant.findFirst();
    if (!rest) {
      res.status(404).json({ error: 'Restaurant record not found' });
      return;
    }

    res.json({
      ...rest,
      weeklySchedule: JSON.parse(rest.weeklyScheduleJson || '[]'),
      cuisineTypes: JSON.parse(rest.cuisineTypesJson || '[]'),
      facilities: JSON.parse(rest.facilitiesJson || '[]'),
      qrPaymentDetails: JSON.parse(rest.qrPaymentJson || '{}'),
      tippingOptions: JSON.parse(rest.tippingOptionsJson || '[10, 15, 18, 20]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/restaurant', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const rest = await prisma.restaurant.findFirst();
    if (!rest) {
      res.status(404).json({ error: 'Restaurant record not found' });
      return;
    }

    const updated = await prisma.restaurant.update({
      where: { id: rest.id },
      data: {
        name: updates.name ?? rest.name,
        tagline: updates.tagline ?? rest.tagline,
        description: updates.description ?? rest.description,
        address: updates.address ?? rest.address,
        phone: updates.phone ?? rest.phone,
        email: updates.email ?? rest.email,
        currencySymbol: updates.currencySymbol ?? rest.currencySymbol,
        taxRatePercent: updates.taxRatePercent !== undefined ? Number(updates.taxRatePercent) : rest.taxRatePercent,
        serviceChargePercent: updates.serviceChargePercent !== undefined ? Number(updates.serviceChargePercent) : rest.serviceChargePercent,
        qrPaymentJson: updates.qrPaymentDetails ? JSON.stringify(updates.qrPaymentDetails) : rest.qrPaymentJson,
        tippingOptionsJson: updates.tippingOptions ? JSON.stringify(updates.tippingOptions) : rest.tippingOptionsJson,
      },
    });

    res.json({
      success: true,
      settings: {
        ...updated,
        weeklySchedule: JSON.parse(updated.weeklyScheduleJson || '[]'),
        cuisineTypes: JSON.parse(updated.cuisineTypesJson || '[]'),
        facilities: JSON.parse(updated.facilitiesJson || '[]'),
        qrPaymentDetails: JSON.parse(updated.qrPaymentJson || '{}'),
        tippingOptions: JSON.parse(updated.tippingOptionsJson || '[]'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. MENU & CATEGORIES (PRISMA)
// ==========================================
apiRouter.get('/menu', async (req: Request, res: Response) => {
  try {
    const { categoryId, dietary, search, availableOnly } = req.query;

    const categories = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const where: any = {};
    if (availableOnly === 'true') {
      where.isAvailable = true;
    }
    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    let items = await prisma.menuItem.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    // Parse JSON columns
    let mappedItems = items.map(i => ({
      ...i,
      dietary: JSON.parse(i.dietaryJson || '[]'),
      ingredients: JSON.parse(i.ingredientsJson || '[]'),
      allergens: JSON.parse(i.allergensJson || '[]'),
      variants: i.variantsJson ? JSON.parse(i.variantsJson) : [],
      addons: i.addonsJson ? JSON.parse(i.addonsJson) : [],
    }));

    if (dietary && typeof dietary === 'string') {
      mappedItems = mappedItems.filter(item => item.dietary.includes(dietary));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      mappedItems = mappedItems.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients.some((ing: string) => ing.toLowerCase().includes(q))
      );
    }

    res.json({ categories, items: mappedItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/menu/items', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const cat = await prisma.menuCategory.findFirst();
    const categoryId = body.categoryId || cat?.id || 'cat-1';

    const created = await prisma.menuItem.create({
      data: {
        name: body.name || 'New Culinary Plate',
        categoryId,
        description: body.description || '',
        price: Number(body.price) || 28.00,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        image: body.image || '/src/assets/images/food_signature_wagyu_1793555392859.jpg',
        rating: 5.0,
        reviewsCount: 0,
        preparationMinutes: Number(body.preparationMinutes) || 15,
        isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
        isSoldOut: Boolean(body.isSoldOut),
        isFeatured: Boolean(body.isFeatured),
        isPopular: Boolean(body.isPopular),
        dietaryJson: JSON.stringify(body.dietary || ['Chef Special']),
        ingredientsJson: JSON.stringify(body.ingredients || ['Seasonal harvest']),
        allergensJson: JSON.stringify(body.allergens || []),
        variantsJson: body.variants ? JSON.stringify(body.variants) : null,
        addonsJson: body.addons ? JSON.stringify(body.addons) : null,
      },
    });

    res.status(201).json({
      ...created,
      dietary: JSON.parse(created.dietaryJson),
      ingredients: JSON.parse(created.ingredientsJson),
      allergens: JSON.parse(created.allergensJson),
      variants: created.variantsJson ? JSON.parse(created.variantsJson) : [],
      addons: created.addonsJson ? JSON.parse(created.addonsJson) : [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/menu/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.originalPrice !== undefined) data.originalPrice = Number(body.originalPrice);
    if (body.image !== undefined) data.image = body.image;
    if (body.isAvailable !== undefined) data.isAvailable = Boolean(body.isAvailable);
    if (body.isSoldOut !== undefined) data.isSoldOut = Boolean(body.isSoldOut);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.preparationMinutes !== undefined) data.preparationMinutes = Number(body.preparationMinutes);
    if (body.dietary !== undefined) data.dietaryJson = JSON.stringify(body.dietary);
    if (body.ingredients !== undefined) data.ingredientsJson = JSON.stringify(body.ingredients);
    if (body.allergens !== undefined) data.allergensJson = JSON.stringify(body.allergens);

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });

    res.json({
      ...updated,
      dietary: JSON.parse(updated.dietaryJson),
      ingredients: JSON.parse(updated.ingredientsJson),
      allergens: JSON.parse(updated.allergensJson),
      variants: updated.variantsJson ? JSON.parse(updated.variantsJson) : [],
      addons: updated.addonsJson ? JSON.parse(updated.addonsJson) : [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/menu/items/:id', async (req: Request, res: Response) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. TABLES & QR SESSIONS (PRISMA)
// ==========================================
apiRouter.get('/tables', async (_req: Request, res: Response) => {
  try {
    const tables = await prisma.diningTable.findMany({
      orderBy: { tableNumber: 'asc' },
    });

    const enriched = await Promise.all(
      tables.map(async t => {
        let session = null;
        let activeOrders: any[] = [];
        if (t.currentSessionId) {
          session = await prisma.tableSession.findUnique({
            where: { id: t.currentSessionId },
          });
          if (session) {
            activeOrders = await prisma.order.findMany({
              where: { sessionId: session.id },
              include: { items: true },
            });
          }
        }

        let waiter = null;
        if (t.assignedWaiterId) {
          waiter = await prisma.waiterProfile.findUnique({
            where: { id: t.assignedWaiterId },
          });
        }

        return {
          ...t,
          session,
          waiter,
          activeOrders,
          totalBill: session ? session.totalAccumulated : 0,
        };
      })
    );

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tables/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.diningTable.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tables/:tableNumber/session', async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const token = req.query.token as string | undefined;

    const table = await prisma.diningTable.findUnique({
      where: { tableNumber },
    });

    if (!table) {
      res.status(404).json({ error: `Table ${tableNumber} not found.` });
      return;
    }

    // Security validation on token
    if (token && table.qrSecretToken && token !== table.qrSecretToken) {
      res.status(403).json({ error: 'Invalid or expired QR security token.' });
      return;
    }

    let session = null;
    if (table.currentSessionId) {
      session = await prisma.tableSession.findUnique({
        where: { id: table.currentSessionId },
      });
    }

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableNumber,
          token: table.qrSecretToken,
          paymentStatus: 'unpaid',
        },
      });

      await prisma.diningTable.update({
        where: { tableNumber },
        data: {
          currentSessionId: session.id,
          status: table.status === 'Available' ? 'Occupied' : table.status,
        },
      });
    }

    let waiter = null;
    if (table.assignedWaiterId) {
      waiter = await prisma.waiterProfile.findUnique({
        where: { id: table.assignedWaiterId },
      });
    }

    const orders = await prisma.order.findMany({
      where: { sessionId: session.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const rest = await prisma.restaurant.findFirst();

    res.json({
      table,
      session,
      waiter: waiter
        ? { ...waiter, assignedTables: JSON.parse(waiter.assignedTablesJson || '[]') }
        : null,
      orders: orders.map(o => ({
        ...o,
        items: o.items.map(i => ({
          ...i,
          customization: i.customizationJson ? JSON.parse(i.customizationJson) : undefined,
        })),
      })),
      settings: rest
        ? {
            ...rest,
            weeklySchedule: JSON.parse(rest.weeklyScheduleJson || '[]'),
            cuisineTypes: JSON.parse(rest.cuisineTypesJson || '[]'),
            facilities: JSON.parse(rest.facilitiesJson || '[]'),
            qrPaymentDetails: JSON.parse(rest.qrPaymentJson || '{}'),
            tippingOptions: JSON.parse(rest.tippingOptionsJson || '[]'),
          }
        : {},
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tables/:tableNumber/session/close', async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    await prisma.diningTable.update({
      where: { tableNumber },
      data: {
        currentSessionId: null,
        status: 'Cleaning',
      },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ORDERS & SERVER-SIDE PRICING VALIDATION (PRISMA)
// ==========================================
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { tableNumber, sessionId, items: submittedItems, specialInstructions } = req.body;

    if (!submittedItems || !Array.isArray(submittedItems) || submittedItems.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    const table = await prisma.diningTable.findUnique({ where: { tableNumber } });
    if (!table) {
      res.status(404).json({ error: `Table ${tableNumber} not found.` });
      return;
    }

    const rest = await prisma.restaurant.findFirst();
    const taxRate = (rest?.taxRatePercent || 8.5) / 100;
    const svcRate = (rest?.serviceChargePercent || 5.0) / 100;

    let calculatedSubtotal = 0;
    let maxPrepTime = 15;
    const verifiedOrderItems: any[] = [];

    for (const item of submittedItems) {
      const dbItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!dbItem || !dbItem.isAvailable || dbItem.isSoldOut) {
        res.status(400).json({ error: `Item ${item.menuItemId} is currently unavailable.` });
        return;
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      let unitPrice = dbItem.price;

      if (item.customization?.selectedVariant) {
        const variants = dbItem.variantsJson ? JSON.parse(dbItem.variantsJson) : [];
        const dbV = variants.find((v: any) => v.id === item.customization.selectedVariant.id);
        if (dbV) unitPrice += dbV.price || 0;
      }

      let addonsSum = 0;
      if (item.customization?.selectedAddons && Array.isArray(item.customization.selectedAddons)) {
        const dbAddons = dbItem.addonsJson ? JSON.parse(dbItem.addonsJson) : [];
        for (const addon of item.customization.selectedAddons) {
          const dbA = dbAddons.find((a: any) => a.id === addon.id);
          if (dbA) addonsSum += dbA.price || 0;
        }
      }

      const totalItemUnit = unitPrice + addonsSum;
      const totalItem = totalItemUnit * qty;
      calculatedSubtotal += totalItem;

      if (dbItem.preparationMinutes > maxPrepTime) {
        maxPrepTime = dbItem.preparationMinutes;
      }

      verifiedOrderItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        quantity: qty,
        unitPrice: Number(totalItemUnit.toFixed(2)),
        totalPrice: Number(totalItem.toFixed(2)),
        customizationJson: item.customization ? JSON.stringify(item.customization) : null,
        kdsStatus: 'Pending',
      });
    }

    const tax = Number((calculatedSubtotal * taxRate).toFixed(2));
    const serviceCharge = Number((calculatedSubtotal * svcRate).toFixed(2));
    const finalTotal = Number((calculatedSubtotal + tax + serviceCharge).toFixed(2));

    let activeSessionId = sessionId || table.currentSessionId;
    if (!activeSessionId) {
      const newSess = await prisma.tableSession.create({
        data: {
          tableNumber,
          token: table.qrSecretToken,
          paymentStatus: 'unpaid',
        },
      });
      activeSessionId = newSess.id;
      await prisma.diningTable.update({
        where: { tableNumber },
        data: { currentSessionId: activeSessionId },
      });
    }

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        tableNumber,
        sessionId: activeSessionId,
        waiterId: table.assignedWaiterId,
        subtotal: calculatedSubtotal,
        tax,
        serviceCharge,
        discount: 0,
        total: finalTotal,
        status: 'Order Placed',
        estimatedMinutes: maxPrepTime,
        items: {
          create: verifiedOrderItems,
        },
      },
      include: { items: true },
    });

    // Accumulate session bill
    const updatedSession = await prisma.tableSession.update({
      where: { id: activeSessionId },
      data: {
        subtotalAccumulated: { increment: calculatedSubtotal },
        taxAccumulated: { increment: tax },
        serviceChargeAccumulated: { increment: serviceCharge },
        totalAccumulated: { increment: finalTotal },
        paymentStatus: 'unpaid',
      },
    });

    await prisma.diningTable.update({
      where: { tableNumber },
      data: { status: 'Preparing' },
    });

    res.status(201).json({
      success: true,
      order: {
        ...newOrder,
        items: newOrder.items.map(i => ({
          ...i,
          customization: i.customizationJson ? JSON.parse(i.customizationJson) : undefined,
        })),
      },
      session: updatedSession,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const { tableNumber, status, sessionId } = req.query;
    const where: any = {};
    if (tableNumber) where.tableNumber = tableNumber;
    if (status) where.status = status;
    if (sessionId) where.sessionId = sessionId;

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      orders.map(o => ({
        ...o,
        items: o.items.map(i => ({
          ...i,
          customization: i.customizationJson ? JSON.parse(i.customizationJson) : undefined,
        })),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        cancellationReason: cancellationReason || undefined,
      },
      include: { items: true },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PAYMENTS & VERIFICATION (PRISMA)
// ==========================================
apiRouter.post('/payments', async (req: Request, res: Response) => {
  try {
    const { sessionId, tableNumber, method, tipAmount, waiterId, transactionReference, receiptNote } = req.body;

    const session = await prisma.tableSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found for settlement' });
      return;
    }

    const tip = Number(tipAmount) || 0;
    const totalAmount = Number((session.totalAccumulated + tip).toFixed(2));
    const isAutoVerified = method === 'Online Card';
    const paymentStatus = isAutoVerified ? 'verified' : 'pending_verification';

    const payment = await prisma.payment.create({
      data: {
        sessionId: session.id,
        tableNumber,
        method,
        subtotal: session.subtotalAccumulated,
        tax: session.taxAccumulated,
        serviceCharge: session.serviceChargeAccumulated,
        tipAmount: tip,
        totalAmount,
        status: paymentStatus,
        transactionReference: transactionReference || (isAutoVerified ? `AUTH-STRIPE-${Date.now()}` : null),
        receiptNote: receiptNote || null,
        verifiedAt: isAutoVerified ? new Date() : null,
        verifiedBy: isAutoVerified ? 'Automated Gateway' : null,
      },
    });

    // Record Waiter Tip if selected
    if (tip > 0 && waiterId) {
      const waiter = await prisma.waiterProfile.findUnique({ where: { id: waiterId } });
      if (waiter) {
        await prisma.tip.create({
          data: {
            tableNumber,
            sessionId: session.id,
            waiterId: waiter.id,
            waiterName: waiter.name,
            amount: tip,
            percentage: session.subtotalAccumulated > 0 ? Math.round((tip / session.subtotalAccumulated) * 100) : 0,
            paymentMethod: method,
            status: isAutoVerified ? 'paid' : 'pending',
          },
        });

        if (isAutoVerified) {
          await prisma.waiterProfile.update({
            where: { id: waiter.id },
            data: { totalTips: { increment: tip } },
          });
        }
      }
    }

    // Update session & table
    const updatedSession = await prisma.tableSession.update({
      where: { id: session.id },
      data: {
        paymentStatus: isAutoVerified ? 'paid' : 'pending_verification',
      },
    });

    await prisma.diningTable.update({
      where: { tableNumber },
      data: {
        status: isAutoVerified ? 'Available' : 'Awaiting Payment',
      },
    });

    res.status(201).json({
      success: true,
      payment,
      session: updatedSession,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/payments/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, staffName } = req.body;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (action === 'approve') {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: 'verified',
          verifiedAt: new Date(),
          verifiedBy: staffName || 'Floor Cashier',
        },
      });

      await prisma.tableSession.update({
        where: { id: payment.sessionId },
        data: { paymentStatus: 'paid' },
      });

      await prisma.diningTable.update({
        where: { tableNumber: payment.tableNumber },
        data: { status: 'Cleaning' },
      });

      // Update tips to paid
      const tips = await prisma.tip.findMany({ where: { sessionId: payment.sessionId } });
      for (const t of tips) {
        if (t.status !== 'paid') {
          await prisma.tip.update({ where: { id: t.id }, data: { status: 'paid' } });
          await prisma.waiterProfile.update({
            where: { id: t.waiterId },
            data: { totalTips: { increment: t.amount } },
          });
        }
      }

      res.json({ success: true, payment: updated });
    } else {
      const updated = await prisma.payment.update({
        where: { id },
        data: { status: 'rejected' },
      });
      res.json({ success: true, payment: updated });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/payments', async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. WAITERS & TIPS (PRISMA)
// ==========================================
apiRouter.get('/waiters', async (_req: Request, res: Response) => {
  try {
    const waiters = await prisma.waiterProfile.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(
      waiters.map(w => ({
        ...w,
        assignedTables: JSON.parse(w.assignedTablesJson || '[]'),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tips/analytics', async (_req: Request, res: Response) => {
  try {
    const paidTips = await prisma.tip.findMany({ where: { status: 'paid' } });
    const pendingTips = await prisma.tip.findMany({ where: { status: 'pending' } });
    const waiters = await prisma.waiterProfile.findMany();

    const totalTips = paidTips.reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = pendingTips.reduce((sum, t) => sum + t.amount, 0);

    const byWaiter = waiters.map(w => {
      const wTips = paidTips.filter(t => t.waiterId === w.id);
      return {
        waiterId: w.id,
        waiterName: w.name,
        photoUrl: w.photoUrl,
        count: wTips.length,
        amount: wTips.reduce((sum, t) => sum + t.amount, 0),
      };
    });

    const recentTips = await prisma.tip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      totalTips,
      pendingTips: pendingTotal,
      byWaiter,
      recentTips,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. REVIEWS (PRISMA)
// ==========================================
apiRouter.get('/reviews', async (_req: Request, res: Response) => {
  try {
    const reviews = await prisma.customerReview.findMany({
      where: { isModerated: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { sessionId, tableNumber, customerName, overallRating, foodRating, serviceRating, cleanlinessRating, valueRating, comment, photoUrl } = req.body;

    if (sessionId) {
      const existing = await prisma.customerReview.findFirst({ where: { sessionId } });
      if (existing) {
        res.status(400).json({ error: 'A review has already been submitted for this dining session.' });
        return;
      }
    }

    const created = await prisma.customerReview.create({
      data: {
        sessionId,
        tableNumber,
        customerName: customerName || 'Valued Guest',
        overallRating: Number(overallRating) || 5,
        foodRating: Number(foodRating) || 5,
        serviceRating: Number(serviceRating) || 5,
        cleanlinessRating: Number(cleanlinessRating) || 5,
        valueRating: Number(valueRating) || 5,
        comment: comment || '',
        photoUrl,
        isVerifiedDiner: Boolean(sessionId || tableNumber),
        isModerated: false,
      },
    });

    if (sessionId) {
      await prisma.tableSession.update({
        where: { id: sessionId },
        data: { reviewSubmitted: true },
      });
    }

    res.status(201).json({ success: true, review: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/reviews/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isModerated, adminReply } = req.body;
    const updated = await prisma.customerReview.update({
      where: { id },
      data: {
        isModerated: isModerated !== undefined ? isModerated : undefined,
        adminReply: adminReply !== undefined ? adminReply : undefined,
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. KDS & OVERALL ANALYTICS (PRISMA)
// ==========================================
apiRouter.get('/kds', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['Order Placed', 'Order Confirmed', 'Preparing', 'Ready to Serve'],
        },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json(
      orders.map(o => ({
        ...o,
        items: o.items.map(i => ({
          ...i,
          customization: i.customizationJson ? JSON.parse(i.customizationJson) : undefined,
        })),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const verifiedPayments = await prisma.payment.findMany({ where: { status: 'verified' } });
    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.totalAmount, 0);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayRevenue = verifiedPayments
      .filter(p => new Date(p.createdAt) >= startOfToday)
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const allTables = await prisma.diningTable.findMany();
    const activeTablesCount = allTables.filter(t => t.status !== 'Available').length;
    const availableTablesCount = allTables.filter(t => t.status === 'Available').length;

    const pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ['Order Placed', 'Preparing'] } },
    });

    const pendingPaymentsCount = await prisma.payment.count({
      where: { status: 'pending_verification' },
    });

    const reviews = await prisma.customerReview.findMany();
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1)
      : '5.0';

    const paidTips = await prisma.tip.findMany({ where: { status: 'paid' } });
    const totalTips = paidTips.reduce((sum, t) => sum + t.amount, 0);

    const totalOrders = await prisma.order.count();

    res.json({
      totalRevenue,
      todayRevenue,
      totalOrders,
      pendingOrdersCount,
      activeTablesCount,
      availableTablesCount,
      totalTables: allTables.length,
      avgRating: Number(avgRating),
      totalReviews: reviews.length,
      totalTips,
      pendingPaymentsCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. SERVICE BELL & TABLESIDE REQUESTS
// ==========================================
apiRouter.post('/service-requests', async (req: Request, res: Response) => {
  try {
    const { tableNumber, requestType, type, note } = req.body;
    const finalType = requestType || type;
    if (!tableNumber || !finalType) {
      res.status(400).json({ error: 'Table number and request type are required.' });
      return;
    }

    const created = await prisma.serviceRequest.create({
      data: {
        tableNumber,
        requestType: finalType,
        note: note || null,
        status: 'Pending',
      },
    });

    res.status(201).json({ success: true, request: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/service-requests', async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: { status: { in: ['Pending', 'Acknowledged'] } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/service-requests/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. RESERVATIONS & BOOKING ENGINE
// ==========================================
apiRouter.post('/reservations', async (req: Request, res: Response) => {
  try {
    const { guestName, guestEmail, guestPhone, partySize, date, timeSlot, section, specialRequests } = req.body;
    if (!guestName || !guestEmail || !date || !timeSlot) {
      res.status(400).json({ error: 'Name, email, date, and time slot are required.' });
      return;
    }

    const bookingCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const reservation = await prisma.reservation.create({
      data: {
        bookingCode,
        guestName,
        guestEmail,
        guestPhone: guestPhone || '',
        partySize: Number(partySize) || 2,
        date,
        timeSlot,
        section: section || 'Main Dining Room',
        specialRequests: specialRequests || null,
        status: 'Confirmed',
      },
    });

    res.status(201).json({ success: true, reservation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reservations', async (_req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Reset & Re-Seed
apiRouter.post('/system/reset', async (_req: Request, res: Response) => {
  try {
    // Delete transactional data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.tip.deleteMany();
    await prisma.customerReview.deleteMany();
    await prisma.tableSession.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.diningTable.deleteMany();
    await prisma.waiterProfile.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    const { seedPrismaDatabase } = await import('../prisma/seed.ts');
    await seedPrismaDatabase();

    res.json({ success: true, message: 'Database reset and re-seeded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
