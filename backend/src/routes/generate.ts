import express from 'express';
import { prisma } from '../prismaClient';
import { generatePersonalizedVideo } from '../services/syncService';

const router = express.Router();

// Debug routes
router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Generate router root is working' });
});

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Generate router test is working' });
});

// Helper: Neon/Postgres-safe DB update
async function safeUpdateVideoRequest(id: string, data: any) {
  try {
    return await prisma.videoRequest.update({ where: { id }, data });
  } catch (err: any) {
    if (err.code === 'E57P01') { // Neon disconnected
      console.warn('Connection terminated, reconnecting...');
      await prisma.$connect();
      return await prisma.videoRequest.update({ where: { id }, data });
    }
    throw err;
  }
}

// Create video request and trigger SyncLabs
router.post('/', async (req, res) => {
  console.log('POST /api/generate hit:', req.body);

  let rec = null;

  try {
    const { actorId, name, city, phone } = req.body;

    if (!actorId || !name || !city || !phone) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Step 1: Create video request in DB
    rec = await prisma.videoRequest.create({
      data: { actorId, name, city, phone, status: 'pending' },
    });

    // Step 2: Trigger SyncLabs video generation
    const syncResult = await generatePersonalizedVideo({
      actorId,
      name,
      city,
      requestId: rec.id,
      // syncJobId: syncResult.response?.id,
    });

    console.log('SyncLabs request sent:', syncResult.request);

    // Step 3: Update DB with initial SyncLabs request info
   await safeUpdateVideoRequest(rec.id, {
  status: 'generating',
  syncJobId: syncResult.videoId,
  syncRequest: syncResult.request,
  syncResponse: syncResult.response
});


    // Respond immediately; actual video sending handled in webhook
    return res.json({ ok: true, id: rec.id });

  } catch (err: any) {
    console.error('Error in generate endpoint:', err);

    if (rec) {
      try {
        await safeUpdateVideoRequest(rec.id, {
          status: 'failed',
          syncResponse: err.response?.data || { error: err.message },
        });
      } catch (updateErr) {
        console.error('Failed to update videoRequest after error:', updateErr);
      }
    }

    return res.status(500).json({
      ok: false,
      error: err.message || 'Failed to generate video',
    });
  }
});

export default router;
