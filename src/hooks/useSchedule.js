import { useEffect, useState } from "react";
import { isToday, isClassFinished } from "../utils/date";

export default function useSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/.netlify/functions/classes");

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const now = new Date();

      const filtered = data
        .filter((item) => isToday(item.start))
        .filter((item) => !isClassFinished(item.end, now))
        .sort((a, b) => new Date(a.start) - new Date(b.start));

      setClasses(filtered);
      setError("");
    } catch (err) {
      console.error("Schedule fetch error:", err);
      setError(err.message || "Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 30000);
    return () => clearInterval(interval);
  }, []);

  return { classes, loading, error };
}
