import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import twilio from "twilio";
import { checkAvailability } from "./calcom.js";

dotenv.config();
const app = express();

// Security & logging
app.use(helmet());
app.use(morgan("tiny"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/", (req, res) => {
  res.type("text/plain").send("Brightly AI Receptionist is running.");
});
app.get("/healthz", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Check Cal.com availability
app.post("/elevenlabs/tool/check_booking", async (req, res) => {
  try {
    const { date, time } = req.body || {};
    if (!date || !time) return res.status(400).json({ error: "Missing date or time" });
    const available = await checkAvailability(date, time);
    res.json({ available: !!available });
  } catch (err) {
    console.error("check_booking error:", err?.response?.data || err?.message || err);
    res.status(500).json({ error: "Error checking availability" });
  }
});

// Transfer to human
app.post("/transfer", async (req, res) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER, HUMAN_NUMBER, BASE_URL } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_NUMBER || !HUMAN_NUMBER || !BASE_URL) {
    return res.status(500).json({ error: "Missing Twilio or BASE_URL env vars" });
  }
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  try {
    await client.calls.create({
      to: HUMAN_NUMBER,
      from: TWILIO_NUMBER,
      url: `${BASE_URL}/twilio/voice-bridge`
    });
    res.json({ message: "Transferred to human agent" });
  } catch (err) {
    console.error("Twilio transfer error:", err?.response?.data || err?.message || err);
    res.status(500).json({ error: "Error transferring call" });
  }
});

// Twilio voice bridge
app.post("/twilio/voice-bridge", (req, res) => {
  const vr = new twilio.twiml.VoiceResponse();
  vr.say("Connecting you to a human agent, please hold.");
  vr.dial(process.env.HUMAN_NUMBER);
  res.type("text/xml").send(vr.toString());
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Brightly AI server listening on port ${PORT}`));
