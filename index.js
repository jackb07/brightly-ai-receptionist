import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";
import { checkAvailability } from "./calcom.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

/**
 * Check booking availability via Cal.com
 */
app.post("/check_booking", async (req, res) => {
  try {
    const { date, time } = req.body;
    const available = await checkAvailability(date, time);
    res.json({ available });
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ error: "Error checking availability" });
  }
});

/**
 * Transfer to human agent via Twilio
 */
app.post("/transfer", async (req, res) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    await client.calls.create({
      to: process.env.HUMAN_NUMBER,
      from: process.env.TWILIO_NUMBER,
      url: `${process.env.BASE_URL}/twilio/voice-bridge`
    });

    res.json({ message: "Transferred to human agent" });
  } catch (err) {
    console.error("Transfer error:", err.message);
    res.status(500).json({ error: "Error transferring call" });
  }
});

/**
 * Twilio XML Response for voice bridge
 */
app.post("/twilio/voice-bridge", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Connecting you to a human agent, please hold.");
  twiml.dial(process.env.HUMAN_NUMBER);
  res.type("text/xml").send(twiml.toString());
});

/**
 * Health check (for Render)
 */
app.get("/", (req, res) => {
  res.send("🚀 Brightly AI Receptionist is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
