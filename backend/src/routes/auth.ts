import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'TRADER' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = role === 'MERCHANT' ? uuidv4() : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        apiKey,
        insuranceDeposit: role === 'TRADER' ? 100 : 0,
        balance: role === 'TRADER' ? 1000 : 0,
      },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        frozenBalance: true,
        insuranceDeposit: true,
        isOnline: true,
        currency: true,
        apiKey: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        balance: user.balance,
        frozenBalance: user.frozenBalance,
        insuranceDeposit: user.insuranceDeposit,
        isOnline: user.isOnline,
        currency: user.currency,
        apiKey: user.apiKey,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        frozenBalance: true,
        insuranceDeposit: true,
        isOnline: true,
        currency: true,
        apiKey: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/online', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { isOnline: Boolean(isOnline) },
      select: { id: true, isOnline: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
