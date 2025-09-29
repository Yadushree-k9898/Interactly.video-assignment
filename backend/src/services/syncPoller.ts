// services/syncPoller.ts
import axios from "axios";
import { prisma } from "../prismaClient";

export async function pollSyncLabsJob(jobId: string, requestId: number, userPhone?: string) {
  let attempts = 0;
  const maxAttempts = 20; // maximum polling attempts
  const interval = 30 * 1000; // 30 seconds

  const polling = setInterval(async () => {
    attempts++;
    console.log(`🔄 Checking job ${jobId}, attempt ${attempts}`);

    try {
      const resp = await axios.get(`${process.env.SYNC_API_BASE}/v2/generate/${jobId}`, {
        headers: { "x-api-key": process.env.SYNC_API_KEY },
      });

      const data = resp.data;
      console.log("SyncLabs poll response:", data);

      if (data.status === "COMPLETED" && data.outputUrl) {
        console.log(`✅ Job ${jobId} completed: ${data.outputUrl}`);

        // Update DB with video URL
        await prisma.videoRequest.update({
          where: { id: requestId },
          data: { status: "generated", videoUrl: data.outputUrl, syncResponse: data },
        });

        // Optional: WhatsApp notification
        if (userPhone) {
          try {
            const twilio = require("twilio")(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );

            await twilio.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: `whatsapp:${userPhone}`,
              body: "🎉 Your personalized video is ready!",
              mediaUrl: [data.outputUrl],
            });

            console.log(`📲 WhatsApp sent to ${userPhone}`);
          } catch (twilioErr: any) {
            console.error("❌ Failed to send WhatsApp:", twilioErr.message);
          }
        }

        clearInterval(polling); // stop polling
      } else if (attempts >= maxAttempts) {
        console.log(`❌ Job ${jobId} did not complete in time`);

        await prisma.videoRequest.update({
          where: { id: requestId },
          data: { status: "timeout", syncResponse: data },
        });

        clearInterval(polling); // stop polling
      } else {
        console.log(`⏳ Not ready yet, retrying in ${interval / 1000}s...`);
      }
    } catch (err: any) {
      console.error("Polling failed:", err.message);

      if (attempts >= maxAttempts) {
        console.log(`❌ Max attempts reached for job ${jobId}`);
        clearInterval(polling);
      }
    }
  }, interval);

  // Start polling after 10 seconds delay
  setTimeout(() => {
    console.log(`🚀 Starting polling for job ${jobId}`);
  }, 10 * 1000);
}
