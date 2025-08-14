// -------------------- Imports --------------------
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";

// -------------------- Load Environment Variables --------------------
dotenv.config();

// -------------------- App Setup --------------------
const app = express();
app.use(bodyParser.json());

// -------------------- Cal.com Availability Check --------------------
async function checkAvailability(date, time) {
  try {
    const res = await axios.get(`https://api.cal.com/v1/availability/${process.env.CALCOM_USERNAME}`, {
      params: { date, time },
      headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` }
    });
    return res.data?.available || false;
  } catch (err) {
    console.error("Cal.com API error:", err.message);
    return false;
  }
}

// -------------------- ElevenLabs Tool: Check Booking --------------------
app.post("/elevenlabs/tool/check_booking", async (req, res) => {
  try {
    const { date, time } = req.body;
    const available = await checkAvailability(date, time);
    res.json({ available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error checking availability" });
  }
});

// -------------------- ElevenLabs Tool: Transfer Call --------------------
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
    console.error(err);
    res.status(500).json({ error: "Error transferring call" });
  }
});

// -------------------- Twilio Voice Bridge --------------------
app.post("/twilio/voice-bridge", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Connecting you to a human agent, please hold.");
  twiml.dial(process.env.HUMAN_NUMBER);
  res.type("text/xml").send(twiml.toString());
});

// -------------------- Server Start --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
