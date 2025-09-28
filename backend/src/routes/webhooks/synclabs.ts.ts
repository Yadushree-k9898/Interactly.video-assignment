import express from 'express';
import { prisma } from '../../prismaClient';
import { sendWhatsAppVideo } from '../../services/whatsappService';

const router = express.Router();

// SyncLabs webhook for video completion
router.post('/synclabs', async (req, res) => {
  const { requestId } = req.query as { requestId: string };
  const { output_url, id } = req.body; // SyncLabs sends final video URL in `output_url`

  if (!requestId || !output_url) {
    return res.status(400).json({ ok: false, error: 'Missing requestId or video URL' });
  }

  try {
    // Update DB with final video URL
    const rec = await prisma.videoRequest.update({
      where: { id: parseInt(requestId) },
      data: { syncResponse: req.body, status: 'generated' },
    });

    console.log(`Video generated for request ${requestId}: ${output_url}`);

    // Send video via WhatsApp
    const waRes = await sendWhatsAppVideo(rec.phone, output_url);

    // Update DB with WhatsApp status
    await prisma.videoRequest.update({
      where: { id: parseInt(requestId) },
      data: { whatsappResponse: waRes, status: 'sent' },
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error in SyncLabs webhook:', err);
    res.status(500).json({ ok: false, error: err });
  }
});

export default router;
