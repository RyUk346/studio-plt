import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";

export default function useLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sheets?type=leaderboard`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `HTTP ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();

        setLeaders(data.leaders || []);
        setHeading(data.heading || "");
        setSubheading(data.subheading || "");
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    const interval = setInterval(fetchLeaderboard, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { leaders, heading, subheading, loading, error };
}
