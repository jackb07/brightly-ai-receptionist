import axios from "axios";

/**
 * Check availability for a given date and time using Cal.com API.
 * Always returns a boolean — never crashes your app.
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 */
export async function checkAvailability(date, time) {
  // Basic input validation
  if (!date || !time) {
    console.warn("❌ Missing date or time in checkAvailability()");
    return false;
  }

  try {
    const res = await axios.get(`https://api.cal.com/v1/availability`, {
      params: { date, time },
      headers: { Authorization: `Bearer ${process.env.CALCOM_API_KEY}` }
    });

    // Handle cases where API doesn't send expected data
    if (res.data && typeof res.data.available === "boolean") {
      return res.data.available;
    } else {
      console.warn("⚠️ Cal.com API responded but 'available' is missing");
      return false;
    }

  } catch (err) {
    console.error("❌ Cal.com API error:", err.message || err);
    return false; // Fail gracefully
  }
}
