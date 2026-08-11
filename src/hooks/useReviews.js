import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { isMessageSafe } from "../utils/messageFilter";

/* ──────────────────────────────────────────────────────────────────────────
   Studio PLT member reviews.

   Reviews live in Momence. This hook reads them from THIS app's backend
   (GET /api/reviews), which proxies Momence's public reviews endpoint —
   the same one their website's embed plugin calls. Going through our own
   server keeps the Momence signature out of the client bundle, caches the
   upstream call, and works on the in-store screen (which can't always
   reach external APIs directly). See /api/reviews in server.js.

   The backend already filters to 5-star reviews WITH written text, sorts
   newest-first, moderates them, and caps the list — so this hook mostly
   just polls and re-runs the deterministic word filter as a last guard.
   ────────────────────────────────────────────────────────────────────────── */
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // re-check the backend hourly

export default function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const safe = (json.reviews || [])
          .filter((r) => (r.rating ?? 0) === 5 && r.text && r.text.trim())
          // Defence-in-depth: the backend already moderates every review
          // before it reaches this endpoint. This client-side pass re-runs
          // the deterministic word filter so nothing unsafe can render even
          // from a stale or edge-case payload.
          .filter((r) => isMessageSafe(r.text) && isMessageSafe(r.name || ""));

        if (!cancelled) setReviews(safe);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadReviews();
    const interval = setInterval(loadReviews, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { reviews, loading };
}
