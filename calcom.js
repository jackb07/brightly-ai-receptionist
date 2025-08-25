import axios from "axios";

export async function checkAvailability(date, time) {
  try {
    const response = await axios.post(
      "https://api.cal.com/v1/availability",
      { date, time },
      {
        headers: {
          Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.available;
  } catch (err) {
    console.error("Cal.com API error:", err.message);
    return false;
  }
}
