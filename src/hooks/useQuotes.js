import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";

export default function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        // Fetch from your VPS/Netlify endpoint
        const res = await fetch(`${API_BASE}/api/sheets?type=quotes`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setQuotes(data); // The API already filtered for the last 1 hour
        }
      } catch (err) {
        console.error("Error fetching quotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, []);

  return { quotes, loading };
}
