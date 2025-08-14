import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// ------------------ Cal.com Availability Check ------------------
async function checkAvailability(date, time) {
  try {
    // Combine date + time into ISO format (UTC)
    const datetime = `${date}T${time}:00Z`;

    // Replace 'your-username' with your actual Cal.com username
    const res = await axios.get(
      `https://api.cal.com/v1/availability/your-username`,
      {
        params: { startTime: datetime, endTime: datetime },
        headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` }
      }
    );

    // API returns an array of available slots
    return res.data && res.data.length > 0;
  } catch (err) {
    console.error("Cal.com API error:", err.response?.data || err.message);
    return false;
  }
}

// ------------------ ElevenLabs Agent Config ------------------
app.get("/elevenlabs-agent.json", (req, res) => {
  res.json({
    name: "Brightly AI Receptionist",
    voice: "Toronto",
    tools: [
      {
        name: "check_booking",
        description: "Check availability for a given date and time",
        url: `${process.env.BASE_URL}/elevenlabs/tool/check_booking`,
        method: "POST"
      },
      {
        name: "transfer_call",
        description: "Transfer the call to a human agent",
        url: `${process.env.BASE_URL}/transfer`,
        method: "POST"
      }
    ]
  });
});

// ------------------ API: Check Booking ------------------
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

// ------------------ API: Transfer Call ------------------
app.post("/transfer", async (req, res) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  try {
    await client.calls.create({
