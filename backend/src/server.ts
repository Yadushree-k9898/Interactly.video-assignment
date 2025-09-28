import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prismaClient';
import generateRouter from './routes/generate';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Debug endpoints to verify routing
app.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Server is working' });
});

app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'API endpoint is working' });
});

// Debug route to test POST endpoint directly
app.post('/api/generate-test', (req, res) => {
  console.log('Direct POST test hit:', req.body);
  res.json({ ok: true, message: 'POST endpoint is working' });
});

// Routes
app.use('/api/generate', (req, res, next) => {
  console.log('Generate route hit:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    body: req.body
  });
  next();
}, generateRouter);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  res.status(500).json({
    ok: false,
    error: err.message || 'Something went wrong!',
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
