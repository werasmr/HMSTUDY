import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateApiKey } from '../middleware/auth';
import {
  findMatchingRequisite,
  createPaymentOrder,
  getRequisiteType,
  getRequisiteNumber,
} from '../services/matching';
import { emitToUser } from '../lib/socket';

const router = Router();

router.use(authenticateApiKey);

router.post('/payment', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'RUB', orderId: merchantOrderId, callbackUrl, successUrl } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const currencyCode = String(currency).toUpperCase();
    const match = await findMatchingRequisite(amount, currencyCode, req.user!.id);
    if (!match) {
      return res.status(503).json({ error: 'No available requisites for this currency' });
    }

    const expiryMinutes = parseInt(process.env.ORDER_EXPIRY_MINUTES || '15');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const order = await createPaymentOrder({
      merchantId: req.user!.id,
      merchantOrderId,
      callbackUrl,
      successUrl,
      match,
      expiresAt,
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
      currencyCode: match.currencyCode,
      feeRate: match.feeRate,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create payment' });
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
      currencyCode: order.currencyCode,
      amountUsdt: order.amountUsdt,
      rate: order.rate,
      feeRate: order.feeRate,
      feeAmount: order.feeAmount,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
