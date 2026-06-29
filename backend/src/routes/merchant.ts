import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateApiKey } from '../middleware/auth';
import {
  findMatchingRequisite,
  freezeTraderBalance,
  getRequisiteType,
  getRequisiteNumber,
} from '../services/matching';
import { emitToUser } from '../lib/socket';

const router = Router();

router.use(authenticateApiKey);

router.post('/payment', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, orderId: merchantOrderId, callbackUrl, successUrl } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const match = await findMatchingRequisite(amount, 'PAY_IN');
    if (!match) {
      return res.status(503).json({ error: 'No available requisites' });
    }

    const expiryMinutes = parseInt(process.env.ORDER_EXPIRY_MINUTES || '15');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        merchantOrderId,
        type: 'PAY_IN',
        status: 'WAITING_PAYMENT',
        amount: match.amount,
        amountUsdt: match.amountUsdt,
        rate: match.rate,
        requisiteId: match.requisite.id,
        traderId: match.requisite.traderId,
        merchantId: req.user!.id,
        callbackUrl,
        successUrl,
        expiresAt,
      },
    });

    await freezeTraderBalance(match.requisite.traderId, match.amountUsdt, order.id);

    await prisma.requisite.update({
      where: { id: match.requisite.id },
      data: { lastOrderAt: new Date() },
    });

    emitToUser(match.requisite.traderId, 'new_order', order);

    res.status(201).json({
      orderId: order.id,
      requisite: {
        type: getRequisiteType(match.requisite),
        number: getRequisiteNumber(match.requisite),
        bank: match.requisite.bank,
        ownerName: match.requisite.ownerName,
      },
      amount: match.amount,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.get('/payment/:orderId', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: req.params.orderId }, { merchantOrderId: req.params.orderId }],
        merchantId: req.user!.id,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json({
      orderId: order.id,
      merchantOrderId: order.merchantOrderId,
      status: order.status,
      amount: order.amount,
      amountUsdt: order.amountUsdt,
      rate: order.rate,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
