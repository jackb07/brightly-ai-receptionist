// index.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// =======================
// Check Booking Availability (Cal.com)
// =======================
app.post("/elevenlabs/tool/check_booking", async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ error: "Missing date or time" });
    }

    const calRes = await axios.get("https://api.cal.com/v1/availability", {
      params: { date, time },
      headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` },
    });

    res.json({ available: calRes.data.available || false });
  } catch (err) {
    console.error("Cal.com API error:", err.message);
    res.status(500).json({ error: "Error checking availability" });
  }
});

// =======================
// Transfer Call to Human
// =======================
app.post("/transfer", async (req, res) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.calls.create({
      to: process.env.HUMAN_NUMBER,
      from: process.env.TWILIO_NUMBER,
      url: `${process.env.BASE_URL}/twilio/voice-bridge`,
    });

    res.json({ message: "Transferred to human agent" });
  } catch (err) {
    console.error("Twilio transfer error:", err.message);
    res.status(500).json({ error: "Error transferring call" });
  }
});

// =======================
// Twilio Voice Bridge
// =======================
app.post("/twilio/voice-bridge", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Connecting you to a human agent, please hold.");
  twiml.dial(process.env.HUMAN_NUMBER);

  res.type("text/xml").send(twiml.toString());
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Brightly AI server running on port ${PORT}`);
});
