# Interactly Personalized Video Generator

**A full-stack project that generates personalized videos based on user input and sends them via WhatsApp.**

This project is an assignment/demo showcasing the integration of AI video generation, audio synthesis, cloud storage, and messaging automation. Users can input their **name, city, and phone number**, select an **actor**, and receive a **personalized video** delivered directly to WhatsApp.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Setup & Installation](#setup--installation)
* [How it Works](#how-it-works)
* [Screenshots / Proof of Work](#screenshots--proof-of-work)
* [Future Enhancements](#future-enhancements)
* [Credits](#credits)

---

## Features

* **Personalized Video Generation**: Users can provide their name, city, and choose an actor to generate a custom video.
* **AI-Generated Audio**: Text-to-speech powered by ElevenLabs API.
* **Video Synthesis**: SyncLabs API is used to create lip-synced videos with chosen actor and audio.
* **Cloud Storage**: Videos and audio are uploaded to Cloudinary.
* **WhatsApp Delivery**: Generated video sent automatically to the user’s WhatsApp using Twilio API.
* **Polling System**: Backend checks the SyncLabs job status until the video is ready.
* **Error Handling**: Handles audio generation, video creation, and WhatsApp failures gracefully.

---

## Tech Stack

* **Frontend**: React, TypeScript, TailwindCSS
* **Backend**: Node.js, Express
* **Database**: PostgreSQL (Neon)
* **APIs & Services**:

  * **SyncLabs** – AI video generation
  * **ElevenLabs** – Text-to-speech audio generation
  * **Cloudinary** – Media hosting
  * **Twilio** – WhatsApp notifications
* **ORM**: Prisma
* **Other**: dotenv, axios, cors

---

## Architecture

```text
User Input (name, city, phone, actor)
        │
        ▼
Frontend Form (React)
        │ POST /api/generate
        ▼
Backend (Express)
 ├─ Generate Audio (ElevenLabs)
 ├─ Upload Audio to Cloudinary
 ├─ Generate Video (SyncLabs)
 ├─ Update DB (Prisma)
 └─ Polling Service checks job status
        │
        ▼
Once Video Ready:
 ├─ Update DB with video URL
 └─ Send WhatsApp message (Twilio)
        │
        ▼
User receives personalized video on WhatsApp
```

---

## Project Structure

```
backend/
├─ src/
│  ├─ routes/
│  │  ├─ generate.ts           # Main API endpoint to create video
│  │  ├─ videoStatus.ts        # Check status of video job
│  │  └─ webhooks/             # (Optional) webhooks for syncLabs / WhatsApp
│  ├─ services/
│  │  ├─ syncService.ts        # Calls SyncLabs API for video generation
│  │  ├─ elevenLabsService.ts  # Generates audio from text
│  │  ├─ cloudinaryService.ts  # Uploads audio/video to Cloudinary
│  │  └─ syncPoller.ts         # Polls SyncLabs until video is ready, sends WhatsApp
│  ├─ prismaClient.ts          # Prisma DB client
│  └─ server.ts                # Express server setup
├─ .env                        # API keys & credentials
frontend/
├─ src/
│  └─ pages/Home.tsx           # Form UI, status polling, video playback
```

---

## Setup & Installation

1. **Clone the repo**

```bash
git clone <repo-url>
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up `.env` file**

```env
PORT=4000
DATABASE_URL=<your_postgres_url>

SYNC_API_KEY=<your_sync_api_key>
SYNC_API_BASE=https://api.sync.so

ELEVEN_API_KEY=<your_elevenlabs_api_key>

TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:4000
```

4. **Run the backend**

```bash
npm run dev
```

5. **Frontend**

```bash
cd ../frontend
npm install
npm run dev
```

6. **Join Twilio WhatsApp Sandbox**

Send `join <code>` to the Twilio sandbox number from your WhatsApp to receive messages.

---

## How it Works

1. User fills out the form (name, city, phone, actor) in the frontend.
2. Backend receives request → generates **audio** using ElevenLabs.
3. Audio uploaded to Cloudinary.
4. SyncLabs API generates **personalized video** with actor & audio.
5. Polling service monitors the job until the video is ready.
6. DB updated with **video URL**.
7. WhatsApp message sent to the user with video link.
8. Frontend polls `/api/video-status/:id` to display video in real-time.

---

## Screenshots / Proof of Work

* **Frontend Form** – User inputs name, city, phone, actor.
* **Video Playback** – Video displayed once ready.
* **WhatsApp Message** – User receives generated video.
* **Backend Logs** – Video generation and WhatsApp send success.

---

## Future Enhancements

* Support multiple actors and dynamic scripts.
* Add user authentication and video history.
* Allow downloadable links for generated videos.
* Better error reporting on frontend.

---

## Credits

* **SyncLabs** – AI-powered video generation
* **ElevenLabs** – Text-to-speech
* **Cloudinary** – Media storage
* **Twilio** – WhatsApp messaging

