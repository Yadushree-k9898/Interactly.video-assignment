import express from 'express';
import { prisma } from '../../prismaClient';
import { sendWhatsAppVideo } from '../../services/whatsappService';

const router = express.Router();

router.post('/synclabs', async (req, res) => {
  const { requestId } = req.query as { requestId: string };
  const { outputUrl, id } = req.body;

  if (!requestId || !outputUrl) {
    return res.status(400).json({ ok: false, error: 'Missing requestId or video URL' });
  }

  try {
    // Step 1: Save SyncLabs response & mark as generated
    const rec = await prisma.videoRequest.update({
      where: { id: parseInt(requestId, 10) },
      data: { syncResponse: req.body, status: 'generated' },
    });

    console.log(`✅ Video generated for request ${requestId}: ${outputUrl}`);

    // Step 2: Try sending via WhatsApp
    try {
      const waRes = await sendWhatsAppVideo(rec.phone, outputUrl);

      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: { whatsappResponse: waRes, status: 'sent' },
      });

      console.log(`📲 WhatsApp video sent to ${rec.phone}`);
    } catch (waErr: any) {
      console.error('❌ WhatsApp send failed:', waErr);
      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: { whatsappResponse: { error: waErr.message }, status: 'generated' },
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('❌ Error in SyncLabs webhook:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
});

export default router;
