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

// Create video request and trigger SyncLabs
router.post('/', async (req, res) => {
  console.log('POST /api/generate hit:', req.body);

  let rec = null;

  try {
    const { actorId, name, city, phone } = req.body;

    if (!actorId || !name || !city || !phone) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Create video request in DB
    rec = await prisma.videoRequest.create({
      data: { actorId, name, city, phone, status: 'pending' },
    });

    // Trigger SyncLabs video generation (async)
    const syncResult = await generatePersonalizedVideo({
      actorId,
      name,
      city,
      requestId: rec.id,
    });

    console.log('SyncLabs request sent:', syncResult.request);

    // Update DB with initial SyncLabs request
    await prisma.videoRequest.update({
      where: { id: rec.id },
      data: { syncRequest: syncResult.request, status: 'generating' },
    });

    // Respond immediately; actual video + WhatsApp sending will be handled via webhook
    return res.json({ ok: true, id: rec.id });
  } catch (err: any) {
    console.error('Error in generate endpoint:', err);

    if (rec) {
      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: { status: 'failed', syncResponse: err.response?.data || { error: err.message } },
      });
    }

    return res.status(500).json({ ok: false, error: err.message || 'Failed to generate video' });
  }
});

export default router;
