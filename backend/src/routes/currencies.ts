import { Router } from 'express';
import { getAllCurrencies } from '../services/currency';
import { REGIONS, REGION_LABELS } from '../data/currencies';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const currencies = await getAllCurrencies(true);
    res.json({ currencies, regions: REGIONS, regionLabels: REGION_LABELS });
  } catch {
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

export default router;
