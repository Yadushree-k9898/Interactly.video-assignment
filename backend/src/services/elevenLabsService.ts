// services/elevenLabsService.ts
import axios from "axios";
import fs from "fs";
import path from "path";

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
if (!ELEVEN_API_KEY) {
  throw new Error("Missing environment variable: ELEVEN_API_KEY");
}

export async function generateAudio(text: string, voiceId: string = "EIsgvJT3rwoPvRFG6c4n") {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const response = await axios.post(
      url,
      { text },
      {
        responseType: "arraybuffer", // binary audio
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Make sure audios folder exists
    const audioDir = path.join(process.cwd(), "audios");
    fs.mkdirSync(audioDir, { recursive: true });

    // Write the audio data, not the full response
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(audioDir, fileName);
    fs.writeFileSync(filePath, response.data); // ✅ use response.data

    console.log(`✅ Audio saved: ${filePath}`);
    return filePath;
  } catch (err: any) {
    console.error("❌ ElevenLabs TTS error:", err.response?.data || err.message);
    throw new Error("Failed to generate audio via ElevenLabs");
  }
}
