import express from 'express';
import { prisma } from '../prismaClient';
import { generatePersonalizedVideo } from '../services/syncService';
import { sendWhatsAppVideo } from '../services/whatsappService';

const router = express.Router();

// Debug routes to verify the router is working
router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Generate router root is working' });
});

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Generate router test is working' });
});

router.post('/', async (req, res) => {
  console.log('POST / endpoint hit in generate router');
  console.log('POST /api/generate hit:', {
    body: req.body,
    headers: req.headers
  });
  console.log('Received generate request:', req.body);

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

    // Generate personalized video
    const syncResult = await generatePersonalizedVideo({ actorId, name, city, requestId: rec.id });
    console.log("SyncLabs response:", syncResult.response);
    console.log("Video URL:", syncResult.videoUrl);

    // Update DB with generation info
    await prisma.videoRequest.update({
      where: { id: rec.id },
      data: { syncRequest: syncResult.request, syncResponse: syncResult.response, status: 'generating' },
    });

    // Send WhatsApp video
    const waRes = await sendWhatsAppVideo(phone, syncResult.videoUrl);

    // Update DB with WhatsApp result
    await prisma.videoRequest.update({
      where: { id: rec.id },
      data: { whatsappResponse: waRes, status: 'sent' },
    });

    return res.json({ ok: true, id: rec.id });
  } catch (err: any) {
    console.error('Error in generate endpoint:', {
      error: err,
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });

    if (rec) {
      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: { 
          status: 'failed',
          syncResponse: err.response?.data || { error: err.message }
        },
      });
    }

    return res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to generate video',
      details: err.response?.data || err.stack
    });
  }
});

export default router;
