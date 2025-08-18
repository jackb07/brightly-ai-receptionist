import axios from "axios";

export async function checkAvailability(date, time) {
  const apiKey = process.env.CALCOM_API_KEY;
  const username = process.env.CALCOM_USERNAME || "";
  const apiBase = process.env.CALCOM_API_BASE || "https://api.cal.com";

  if (!apiKey || !date || !time) return false;

  const isoStart = `${date}T${time}:00Z`;
  const candidateUrls = username
    ? [`${apiBase}/v1/availability/${encodeURIComponent(username)}`]
    : [];
  candidateUrls.push(`${apiBase}/v1/availability`);

  const headers = { Authorization: `Bearer ${apiKey}` };

  for (const url of candidateUrls) {
    try {
      const res = await axios.get(url, { params: { date, time, startTime: isoStart, endTime: isoStart }, headers, timeout: 8000 });
      const data = res?.data;
      if (typeof data?.available === "boolean") return data.available;
      if (Array.isArray(data) && data.length > 0) return true;
      if (Array.isArray(data?.slots) && data.slots.length > 0) return true;
    } catch (err) {
      console.warn(`Cal.com request failed at ${url}:`, err?.response?.data || err?.message || err);
    }
  }

  return false;
}
