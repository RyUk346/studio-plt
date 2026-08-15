import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { isMessageSafe } from "../utils/messageFilter";

/* ──────────────────────────────────────────────────────────────────────────
   Public Google reviews.

   Read from THIS app's backend (GET /api/google-reviews), which pulls public
   Google reviews via SerpApi. No Google Business Profile login is needed and
   the SerpApi key stays server-side. See /api/google-reviews in server.js.

   The backend already filters to 5-star reviews WITH written text, sorts
   newest-first, caps the list, and runs full 3-layer fail-closed moderation
   before anything reaches this endpoint — Google reviews are unvetted public
   content, so they get stricter treatment than Momence member reviews.

   Polls less often than the Momence hook because each upstream miss costs
   SerpApi quota; the server's own 6h TTL is the real limiter either way.
   ────────────────────────────────────────────────────────────────────────── */
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // re-check the backend hourly

export default function useGoogleReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/google-reviews`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const safe = (json.reviews || [])
          .filter((r) => (r.rating ?? 0) === 5 && r.text && r.text.trim())
          // Defence-in-depth: the backend already runs all three moderation
          // layers. This client-side pass re-runs the deterministic word
          // filter so nothing unsafe can render even from a stale payload.
          .filter((r) => isMessageSafe(r.text) && isMessageSafe(r.name || ""));

        if (!cancelled) setReviews(safe);
      } catch (err) {
        console.error("Error fetching Google reviews:", err);
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
