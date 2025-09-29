// routes/generate.ts
import express from "express";
import fs from "fs/promises";
import { prisma } from "../prismaClient";
import { generatePersonalizedVideo } from "../services/syncService";
import { generateAudio } from "../services/elevenLabsService";
import { uploadToCloudinary } from "../services/cloudinaryService";
import { pollSyncLabsJob } from "../services/syncPoller";

const router = express.Router();

// Debug routes
router.get("/", (req, res) => {
  res.json({ ok: true, message: "Generate router root is working" });
});

router.get("/test", (req, res) => {
  res.json({ ok: true, message: "Generate router test is working" });
});

// Helper: Neon/Postgres-safe DB update
async function safeUpdateVideoRequest(id: number, data: any) {
  try {
    return await prisma.videoRequest.update({ where: { id }, data });
  } catch (err: any) {
    if (err.code === "E57P01") {
      console.warn("Connection terminated, reconnecting...");
      await prisma.$connect();
      return await prisma.videoRequest.update({ where: { id }, data });
    }
    throw err;
  }
}

// POST /api/generate
router.post("/", async (req, res) => {
  console.log("POST /api/generate hit:", req.body);

  let rec: any = null;

  try {
    const { actorId, name, city, phone } = req.body;

    if (!actorId || !name || !city || !phone) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Step 1: Create video request in DB
    rec = await prisma.videoRequest.create({
      data: { actorId, name, city, phone, status: "pending" },
    });

    console.log("✅ Video request created:", rec.id);

    // Step 2: Generate audio via ElevenLabs
    let audioPath: string;
    try {
      const text = `Hi ${name} from ${city}, thanks for checking this out!`;
      audioPath = await generateAudio(text, "5kMbtRSEKIkRZSdXxrZg");
      console.log("✅ Audio generated at:", audioPath);
    } catch (audioErr) {
      console.error("❌ ElevenLabs audio generation failed:", audioErr);
      await safeUpdateVideoRequest(rec.id, { status: "failed" });
      return res.status(500).json({ ok: false, error: "Audio generation failed" });
    }

    // Step 3: Upload audio to Cloudinary
    let audioUrl: string;
    try {
      audioUrl = await uploadToCloudinary(audioPath);
      console.log("✅ Audio uploaded to Cloudinary:", audioUrl);
    } catch (cloudErr) {
      console.error("❌ Cloudinary upload failed:", cloudErr);
      await safeUpdateVideoRequest(rec.id, { status: "failed" });
      return res.status(500).json({ ok: false, error: "Audio upload failed" });
    }

    // Step 4: Delete local audio file (async cleanup)
    try {
      await fs.unlink(audioPath);
    } catch (unlinkErr) {
      console.warn("⚠️ Failed to delete local audio file:", unlinkErr);
    }

    // Step 5: Trigger SyncLabs video generation
    let syncResult: any;
    try {
      syncResult = await generatePersonalizedVideo({
        actorId,
        audioUrl,
        requestId: rec.id, // number type
      });
      console.log("✅ SyncLabs request sent:", syncResult);
    } catch (syncErr) {
      console.error("❌ SyncLabs request failed:", syncErr);
      await safeUpdateVideoRequest(rec.id, { status: "failed" });
      return res.status(500).json({ ok: false, error: "SyncLabs request failed" });
    }

    // Step 6: Update DB with initial SyncLabs info
    await safeUpdateVideoRequest(rec.id, {
      status: "generating",
      syncJobId: syncResult.videoId,
      syncRequest: syncResult.request,
      syncResponse: syncResult.response,
    });

    // Step 7: Start polling for video completion
    pollSyncLabsJob(syncResult.videoId, rec.id, phone);

    // Step 8: Respond immediately
    return res.json({ ok: true, id: rec.id });
  } catch (err: any) {
    console.error("❌ Error in /generate endpoint:", err);

    if (rec) {
      try {
        await safeUpdateVideoRequest(rec.id, {
          status: "failed",
          syncResponse: err.response?.data || { error: err.message },
        });
      } catch (updateErr) {
        console.error("⚠️ Failed to update videoRequest after error:", updateErr);
      }
    }

    return res.status(500).json({ ok: false, error: err.message || "Failed to generate video" });
  }
});

export default router;
