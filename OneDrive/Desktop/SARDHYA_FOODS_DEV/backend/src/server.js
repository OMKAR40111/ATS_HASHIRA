import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import bookingsRouter from './routes/bookings.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import { initializeDatabase } from './db.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'sardhya-foods-backend' });
});

app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Internal server error' });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

try {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Database initialization failed. Check your MySQL settings in .env.');
  console.error(error);
  process.exit(1);
}
