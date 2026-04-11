import { useEffect, useState } from "react";

const SHEET_ID = "1j_ya2A8-hyTsR53BZh-pj9jp1163t6tGA2fBjDXmCaM";
const TAB_NAME = "Leaderboard";

export default function useLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const url = `/.netlify/functions/leaderboard?sheetId=${encodeURIComponent(
          SHEET_ID,
        )}&tabName=${encodeURIComponent(TAB_NAME)}`;

        const res = await fetch(url);

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `HTTP ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();
        setLeaders(data);
        setError("");
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

  return { leaders, loading, error };
}
