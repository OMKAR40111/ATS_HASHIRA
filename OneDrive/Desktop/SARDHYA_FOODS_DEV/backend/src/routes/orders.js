import { Router } from 'express';
import { createOrder, listOrders } from '../db.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    response.json({ orders: await listOrders() });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const { customerName, email, phone, deliveryMode, address, notes, items } = request.body || {};

    if (!customerName || !email || !phone || !Array.isArray(items) || items.length === 0) {
      response.status(400).json({ message: 'Customer details and cart items are required.' });
      return;
    }

    const order = await createOrder({
      customerName,
      email,
      phone,
      deliveryMode: deliveryMode || 'pickup',
      address: address || '',
      notes: notes || '',
      items
    });

    response.status(201).json({
      order: {
        ...order,
        customerName,
        email,
        phone,
        deliveryMode: deliveryMode || 'pickup',
        address: address || '',
        notes: notes || ''
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
