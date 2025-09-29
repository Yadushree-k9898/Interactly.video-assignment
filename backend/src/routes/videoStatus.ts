// routes/videoStatus.ts
import express from "express";
import { prisma } from "../prismaClient";

const router = express.Router();

// GET /api/video-status/:id
router.get("/:id", async (req, res) => {
  try {
    // Convert string ID from URL to number
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, error: "Invalid video ID" });
    }

    // Fetch video from DB
    const video = await prisma.videoRequest.findUnique({
      where: { id },
    });

    if (!video) {
      return res.status(404).json({ ok: false, error: "Video not found" });
    }

    // Respond with status and video URL
    return res.json({
      ok: true,
      status: video.status,
      videoUrl: video.videoUrl || null,
    });
  } catch (err: any) {
    console.error("Error fetching video status:", err.message);
    return res.status(500).json({ ok: false, error: "Failed to fetch video status" });
  }
});

export default router;
