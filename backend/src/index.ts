import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';

import authRoutes from './routes/auth';
import requisitesRoutes from './routes/requisites';
import ordersRoutes from './routes/orders';
import merchantRoutes from './routes/merchant';
import devicesRoutes from './routes/devices';
import transactionsRoutes from './routes/transactions';
import disputesRoutes from './routes/disputes';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';
import { initSocket } from './lib/socket';
import { getAllowedOrigins } from './lib/cors';
import { processExpiredOrders } from './services/matching';

dotenv.config();

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/requisites', requisitesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '3001');

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
  processExpiredOrders().catch(console.error);
}, 60 * 1000);

export default app;
