import { Request, Response, Router } from 'express';

const router = Router();

router.post('/webhooks/whatsapp/status', async (req: Request, res: Response) => {
  const { MessageSid, MessageStatus, To } = req.body;
  // find VideoRequest by phone or store mapping messageSid -> requestId, then update status
  res.sendStatus(200);
});

export default router;
