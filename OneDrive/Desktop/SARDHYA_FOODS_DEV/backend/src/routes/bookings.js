import { Router } from 'express';
import { createBooking, listBookings } from '../db.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    response.json({ bookings: await listBookings() });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const { customerName, email, phone, eventDate, guestCount, venue, serviceStyle, notes } = request.body || {};

    if (!customerName || !email || !phone || !eventDate || !guestCount || !venue) {
      response.status(400).json({ message: 'Customer, event date, guest count, and venue are required.' });
      return;
    }

    const booking = await createBooking({
      customerName,
      email,
      phone,
      eventDate,
      guestCount,
      venue,
      serviceStyle: serviceStyle || 'drop-off',
      notes: notes || ''
    });

    response.status(201).json({
      booking: {
        ...booking,
        customerName,
        email,
        phone,
        eventDate,
        guestCount: Number(guestCount),
        venue,
        serviceStyle: serviceStyle || 'drop-off',
        notes: notes || ''
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
