import { Router } from 'express';
import { listMenuItems } from '../db.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    response.json({ items: await listMenuItems() });
  } catch (error) {
    next(error);
  }
});

export default router;
