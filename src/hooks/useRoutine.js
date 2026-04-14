import { useEffect, useState } from "react";
import { isToday, isClassFinished } from "../utils/date";

export default function useRoutine() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await fetch("/api/sheets?type=routine");
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `HTTP ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();
        const now = new Date();

        const filtered = data
          .filter((item) => item.start && item.end)
          .filter((item) => isToday(item.start))
          .filter((item) => !isClassFinished(item.end, now))
          .sort((a, b) => new Date(a.start) - new Date(b.start));

        setClasses(filtered);
        setError("");
      } catch (err) {
        console.error("Routine fetch error:", err);
        setError(err.message || "Failed to load routine");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();

    // refresh often so finished classes disappear quickly
    const interval = setInterval(fetchRoutine, 5000);

    return () => clearInterval(interval);
  }, []);

  return { classes, loading, error };
}
