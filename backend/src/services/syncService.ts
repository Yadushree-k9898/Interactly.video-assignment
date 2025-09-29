// services/syncService.ts
import axios from "axios";
import https from "https";

// Helper to handle SyncLabs response
function handleResponse(resp: { data: any; status: number; config: any }) {
  if (!resp.data) throw new Error("Empty response from SyncLabs");

  return {
    request: resp.config.data,
    response: resp.data,
    videoUrl: resp.data.outputUrl,
    videoId: resp.data.id,
  };
}

// Main function
export async function generatePersonalizedVideo({
  actorId,
  audioUrl,    // 👈 new: use audio URL from ElevenLabs
  requestId,
}: any) {
  if (!process.env.SYNC_API_BASE || !process.env.SYNC_API_KEY) {
    throw new Error("Missing environment variables: SYNC_API_BASE or SYNC_API_KEY");
  }

  // Example actor video template
  const actorVideoUrl = "https://assets.sync.so/docs/example-video.mp4";

  const requestPayload = {
    model: "lipsync-2",
    input: [
      { type: "video", url: actorVideoUrl },
      { type: "audio", url: audioUrl } // 👈 now using ElevenLabs audio
    ],
    options: { sync_mode: "loop" },
    webhookUrl: `${process.env.BASE_URL}/webhooks/synclabs?requestId=${requestId}`,
  };

  const axiosInstance = axios.create({
    baseURL: process.env.SYNC_API_BASE,
    timeout: 120000,
    headers: {
      "x-api-key": process.env.SYNC_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    validateStatus: (status) => status >= 200 && status < 500,
    httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: true }),
  });

  try {
    const resp = await axiosInstance.post("/v2/generate", requestPayload);

    if (resp.status >= 400) {
      console.error("SyncLabs API Error:", resp.status, resp.data);
      throw new Error(`SyncLabs error: ${JSON.stringify(resp.data)}`);
    }

    return handleResponse(resp);
  } catch (axiosError: any) {
    console.error("SyncLabs request failed:", axiosError.message || axiosError);
    throw new Error("Failed to generate video via SyncLabs");
  }
}
