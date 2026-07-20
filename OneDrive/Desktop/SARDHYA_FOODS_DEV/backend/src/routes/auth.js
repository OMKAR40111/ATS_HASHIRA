import { Router } from 'express';
import { authenticateUser, registerUser } from '../db.js';

const router = Router();

router.post('/register', async (request, response, next) => {
  try {
    const { name, email, password } = request.body || {};

    if (!email || !password) {
      response.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await registerUser({ name, email, password });

    response.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: `demo-token-${user.id}`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body || {};

    if (!email || !password) {
      response.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      response.status(401).json({ message: 'Invalid login credentials.' });
      return;
    }

    response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: `demo-token-${user.id}`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
