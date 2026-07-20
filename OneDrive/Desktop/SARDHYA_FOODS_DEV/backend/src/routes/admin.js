import { Router } from 'express';
import { getAdminOverview } from '../db.js';

const router = Router();

router.get('/overview', async (_request, response, next) => {
  try {
    response.json(await getAdminOverview());
  } catch (error) {
    next(error);
  }
});

export default router;
