export const formatTime = (time: any): string => {
  // Case 1: Handle object with `hour`, `minute`, and `period` properties
  if (typeof time === "object" && time.hour !== undefined && time.minute !== undefined) {
    const period = time.period;
    if (period !== "AM" && period !== "PM") {
      console.warn("Invalid period:", period);
      return "00:00";
    }

    const hour =
      period === "AM" && time.hour === 12
        ? 0
        : period === "PM" && time.hour !== 12
        ? time.hour + 12
        : time.hour;

    return `${hour.toString().padStart(2, "0")}:${time.minute
      .toString()
      .padStart(2, "0")}`;
  }

  // Case 2: Handle string format from PostgreSQL (e.g., "20:00:00")
  if (typeof time === "string" && time.includes(":")) {
    const parts = time.split(":").map(Number);
    if (parts.length < 2) {
      console.warn("Invalid time string:", time);
      return "00:00";
    }
    const [hour, minute] = parts; // Ignore seconds if present
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  // Case 3: Unsupported format
  console.warn("Unsupported time format:", time);
  return "00:00"; // Default fallback
};
