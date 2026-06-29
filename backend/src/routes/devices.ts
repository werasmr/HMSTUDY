import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('TRADER'));

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const devices = await prisma.device.findMany({
      where: { traderId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const device = await prisma.device.create({
      data: { traderId: req.user!.id, name },
    });
    res.status(201).json(device);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.device.updateMany({
      where: { id: req.params.id, traderId: req.user!.id },
      data: req.body,
    });
    if (device.count === 0) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.device.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.device.deleteMany({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
