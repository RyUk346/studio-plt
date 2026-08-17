import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { timeAgo } from "../utils/date";

/* ──────────────────────────────────────────────────────────────────────────
   REVIEWS CAROUSEL — shared by both review phases of the side panel's loop

   Renders EITHER source, because both backends normalise to the same shape:
     Momence members  → GET /api/reviews        (useReviews.js)
     Google           → GET /api/google-reviews (useGoogleReviews.js)

   Shape: { id, name, rating, text, timestamp, avatarUrl }, plus the optional
   { sessionName, teacherName } that only Momence supplies — the class/teacher
   line simply doesn't render for Google reviews.

   Layout is a VERTICAL CAROUSEL: several cards are visible at once, and
   every `stepMs` the column scrolls up by exactly one card with a smooth
   eased transition. Repeat is OFF — the track plays through the list once
   and then rests on the last review (it does not wrap back to the top).

   The board mounts this only while its phase is on screen, so the carousel
   restarts from the top on its own each cycle. Review data lives in the
   board's hooks, so unmounting never interrupts the refresh.

   Props:
   - reviews         → the moderated 5-star reviews to show
   - stepMs          → pause per step, driven by the board (REVIEW_STEP_MS)
   - tailMs          → extra rest on the last card before handing over
   - onCycleComplete → fired once every review has had its turn at the top.
                       Like the leaderboard, the carousel announces that it
                       has finished rather than letting the board predict it
                       from `reviews.length × stepMs` — two clocks drift.
                       Omit it and the carousel loops on its own.
   ────────────────────────────────────────────────────────────────────────── */
const STEP_TRANSITION_MS = 1400; // silky 1.4s glide per step
// Symmetric ease-in-out: starts gently, cruises, settles gently — much
// smoother on a big in-store screen than a sharp ease-out.
const STEP_EASING = "cubic-bezier(0.45, 0.05, 0.25, 1)";

export default function ReviewsCarousel({
  reviews = [],
  stepMs = 6000,
  tailMs = 0,
  onCycleComplete,
}) {
  // Carousel position: index of the card currently at the top of the viewport.
  const [step, setStep] = useState(0);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef(null);

  // Advance the carousel one card at a time.
  useEffect(() => {
    if (!reviews.length) return;
    if (step >= reviews.length - 1) return; // on the last card — see below

    const timer = setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, reviews.length - 1));
    }, stepMs);

    return () => clearTimeout(timer);
  }, [step, reviews.length, stepMs]);

  // Last card has had its turn → the cycle is done. Hand back to the board
  // if it's driving a rotation, otherwise loop back to the top.
  useEffect(() => {
    if (!reviews.length) return;
    if (step < reviews.length - 1) return; // not finished yet

    const timer = setTimeout(() => {
      if (onCycleComplete) {
        onCycleComplete();
        return;
      }
      setStep(0);
    }, stepMs + tailMs);

    return () => clearTimeout(timer);
  }, [step, reviews.length, stepMs, tailMs, onCycleComplete]);

  // Measure how far the track must slide so card[step] sits at the top.
  // Measured from the DOM (offsetTop) so cards can have natural heights.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[step];
    setOffset(child ? child.offsetTop : 0);
  }, [step, reviews]);

  if (!reviews.length) return null;

  const activeDot = Math.min(step, reviews.length - 1);

  const renderCard = (review, key) => {
    const name = review.name || "Studio member";
    const context = [review.sessionName, review.teacherName]
      .filter(Boolean)
      .join(" · ");

    return (
      <div key={key} className="mb-3 rounded-lg bg-black/25 p-3">
        {/* 1. Reviewer — avatar + name */}
        <div className="flex items-center gap-2">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt=""
              className="h-5 w-5 rounded-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Broken/blocked avatar → hide the img so only the name shows
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
              {name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-white/70">{name}</span>
        </div>

        {/* 2. Star rating + when the review was posted */}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="text-sm leading-none text-[#ffc107]"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {"★".repeat(review.rating)}
          </span>
          {review.timestamp ? (
            <span className="text-[11px] leading-none text-white/50">
              {timeAgo(review.timestamp)}
            </span>
          ) : null}
        </div>

        {/* 3. Review text */}
        <p className="mt-1 line-clamp-4 text-sm leading-snug text-white/90 max-[1750px]:text-xs">
          {"“"}
          {review.text}
          {"”"}
        </p>

        {/* 4. Which class, and who taught it */}
        {context ? (
          <p className="mt-1.5 truncate text-[11px] leading-none text-white/45">
            {context}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="panel-enter flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Carousel track: the card list is rendered ONCE — repeat is off,
            so there is no wrap-around and no duplicate copy is needed. */}
        <div
          ref={trackRef}
          className="reviews-track"
          style={{
            // translate3d keeps the glide on the GPU compositor — no
            // layout/paint per frame, so the motion stays butter-smooth.
            transform: `translate3d(0, -${offset}px, 0)`,
            transition: `transform ${STEP_TRANSITION_MS}ms ${STEP_EASING}`,
          }}
        >
          {reviews.map((review, idx) => renderCard(review, review.id ?? idx))}
        </div>
      </div>

      {/* Carousel dots — which review is currently at the top */}
      {reviews.length > 1 && (
        <div className="mt-1.5 flex shrink-0 justify-center gap-1">
          {reviews.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 w-1 rounded-full transition-colors ${
                idx === activeDot ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
