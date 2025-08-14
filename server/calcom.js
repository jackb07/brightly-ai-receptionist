import axios from "axios";

export async function checkAvailability(date, time) {
  try {
    // Combine date + time into ISO format
    const datetime = `${date}T${time}:00Z`;

    // Change 'your-username' to your actual Cal.com username
    const res = await axios.get(`https://api.cal.com/v1/availability/jackbogaert07`, {
      params: { startTime: datetime, endTime: datetime },
      headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` }
    });

    // API returns an array of available slots
    return res.data && res.data.length > 0;
  } catch (err) {
    console.error("Cal.com API error:", err.response?.data || err.message);
    return false;
  }
}
