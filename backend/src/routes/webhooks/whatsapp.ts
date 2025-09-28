import { Router, Request, Response } from 'express';
import { prisma } from '../../prismaClient';

const router = Router();

// WhatsApp status updates webhook
router.post('/webhooks/whatsapp/status', async (req: Request, res: Response) => {
  const { MessageSid, MessageStatus, To } = req.body;

  try {
    // Find video request by phone or mapping (you can store MessageSid -> requestId if needed)
    // Example: update status based on MessageStatus
    const rec = await prisma.videoRequest.findFirst({ where: { phone: To } });

    if (rec) {
      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: { whatsappResponse: { ...(rec.whatsappResponse || {}), status: MessageStatus } },
      });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('Error in WhatsApp status webhook:', err);
    return res.sendStatus(500);
  }
});

export default router;
