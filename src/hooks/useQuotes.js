import { useEffect, useState } from "react";

export default function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch("/.netlify/functions/sheets?type=quotes");

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `HTTP ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();
        setQuotes(data);
        setError("");
      } catch (err) {
        console.error("Quotes fetch error:", err);
        setError(err.message || "Failed to load quotes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 15000);

    return () => clearInterval(interval);
  }, []);

  return { quotes, loading, error };
}
