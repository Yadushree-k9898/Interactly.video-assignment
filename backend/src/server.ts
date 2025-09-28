import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate';
import synclabsWebhook from './routes/webhooks/synclabs.ts';
import whatsappWebhook from './routes/webhooks/whatsapp';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS
app.use(cors({ origin: true, credentials: true }));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Debug endpoints
app.get('/test', (req, res) => res.json({ ok: true, message: 'Server working' }));
app.get('/api/test', (req, res) => res.json({ ok: true, message: 'API working' }));

// Mount routers
app.use('/api/generate', generateRouter);
app.use('/api/webhooks/synclabs', synclabsWebhook);
app.use('/api/webhooks/whatsapp', whatsappWebhook);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all 404
app.use((req, res) => res.status(404).json({ ok: false, error: 'Route not found' }));

// Error middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ ok: false, error: err.message || 'Something went wrong' });
});

// Start server
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
