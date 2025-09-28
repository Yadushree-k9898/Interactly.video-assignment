import { Router, Request, Response } from 'express';
import { prisma } from '../../prismaClient';

const router = Router();

// WhatsApp status updates webhook
router.post('/webhooks/whatsapp/status', async (req: Request, res: Response) => {
  const { MessageSid, MessageStatus, To } = req.body;

  try {
    // Find video request by phone
    const rec = await prisma.videoRequest.findFirst({ where: { phone: To } });

    if (rec) {
      // Safely cast JSON field to object
      const existingResponse = (rec.whatsappResponse as Record<string, any>) || {};

      await prisma.videoRequest.update({
        where: { id: rec.id },
        data: {
          whatsappResponse: {
            ...existingResponse,
            status: MessageStatus,
            sid: MessageSid,
          },
        },
      });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('Error in WhatsApp status webhook:', err);
    return res.sendStatus(500);
  }
});

export default router;
