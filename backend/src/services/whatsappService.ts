import Twilio from 'twilio';
const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsAppVideo(phone: string, videoUrl: string) {
  // Twilio expects whatsapp:+{country}{number}
  const to = `whatsapp:${phone}`;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  const message = await client.messages.create({
    from,
    to,
    body: 'Here is your personalized video!',
    mediaUrl: [videoUrl]  // Twilio will fetch this URL and send video
  });
  return message;
}
