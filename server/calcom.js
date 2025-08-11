import axios from "axios";

export async function checkAvailability(date, time) {
  try {
    const res = await axios.get(`https://api.cal.com/v1/availability`, {
      params: { date, time },
      headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` }
    });
    return res.data.available || false;
  } catch (err) {
    console.error("Cal.com API error:", err.message);
    return false;
  }
}
