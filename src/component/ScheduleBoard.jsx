import { useState, useEffect, useMemo, useCallback } from "react";
import useRoutine from "../hooks/useRoutine";
import ClassCard from "./ClassCard";
import SlidingLeaderboard, {
  SLIDE_INTERVAL_MS,
} from "./SlidingLeaderboard";
import useLeaderboard from "../hooks/useLeaderboard";
import useQuotes from "../hooks/useQuotes";
import QuotesSection from "./QuotesSection";
import ScorePollWidget from "./ScorePollWidget";
import ReviewsCarousel from "./ReviewsCarousel";
import useReviews from "../hooks/useReviews";
import useGoogleReviews from "../hooks/useGoogleReviews";
import { buildRotation } from "../utils/panelRotation";
import { getClassTimingState } from "../utils/date";
import WeatherWidget from "./WeatherWidget";
import useWeather from "../hooks/useWeather";
import { PiGlobeXBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";

/* Side-panel loop timings. The panel cycles
     leaderboard → member reviews → leaderboard → Google reviews
   (see utils/panelRotation.js). Each phase stays on screen just long enough
   to play through its own content once, then hands over. */
// Each review sits at the top of the carousel for 5s. Both sources are
// capped at 6 reviews server-side (MOMENCE_REVIEWS_MAX / GOOGLE_REVIEWS_MAX),
// so a full review phase runs 6 × 5s + the tail ≈ 32.5s.
const REVIEW_STEP_MS = 5000; // pause per review card
const REVIEW_TAIL_MS = 2500; // rest on the last review before handing over

// Both review phases share a heading; the Google phase just adds the Google
// mark so it's clear where those reviews came from. Review phases have no
// subheading — the <p> is skipped entirely rather than rendered empty, which
// would still reserve a line box and leave a gap under the heading.
const REVIEWS_HEADING = "Our Growing Community";

export default function ScheduleBoard() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const weather = useWeather();
  const { classes, loading, error } = useRoutine();
  const {
    leaders,
    heading: leaderboardHeading,
    subheading: leaderboardSubheading,
    milestones,
    loading: leaderLoading,
    error: leaderError,
  } = useLeaderboard();
  const { quotes } = useQuotes();
  const { reviews } = useReviews();
  const { reviews: googleReviews } = useGoogleReviews();

  /* ── Side panel rotation ─────────────────────────────────────────────
     The left column cycles leaderboard → member reviews → leaderboard →
     Google reviews. Each phase's duration is derived from its own content
     so nothing gets cut off mid-cycle:
       - leaderboard → one full pass of its pages
       - either review phase → one step per review, plus a short rest

     Any phase whose source is empty is dropped from the cycle entirely
     (see utils/panelRotation.js), so a missing SerpApi key or an empty
     leaderboard just means fewer phases — never a blank panel. */
  const [phaseIndex, setPhaseIndex] = useState(0);
  // Starts at 1, not 0, on purpose. SlidingLeaderboard only reports its page
  // count while it's mounted, so if the panel ever starts on a review phase
  // before the leaderboard has rendered once, a 0 here would keep
  // hasLeaderboard false forever and the leaderboard could never come back.
  const [leaderPageCount, setLeaderPageCount] = useState(1);

  // Stable identity so SlidingLeaderboard's reporting effect doesn't re-fire
  // on every board re-render (this component ticks once per second).
  const handleLeaderPageCount = useCallback((count) => {
    setLeaderPageCount(count);
  }, []);

  const hasReviews = reviews.length > 0;
  const hasGoogleReviews = googleReviews.length > 0;
  const hasLeaderboard =
    !leaderLoading && !leaderError && leaders.length > 0 && leaderPageCount > 0;

  const rotation = useMemo(
    () =>
      buildRotation({
        leaderboard: hasLeaderboard,
        reviews: hasReviews,
        google: hasGoogleReviews,
      }),
    [hasLeaderboard, hasReviews, hasGoogleReviews],
  );

  // Modulo on read rather than clamping on write, so the index stays valid
  // even when the rotation shrinks (e.g. a source goes empty mid-cycle).
  const phase = rotation.length
    ? rotation[phaseIndex % rotation.length]
    : "leaderboard";

  /* Handoff is EVENT-DRIVEN: whichever view is on screen calls
     onCycleComplete when it has genuinely finished showing its content.
     The board used to predict the duration instead (pageCount × interval),
     but that clock and the child's own clock drifted apart — the leaderboard
     would wrap back to page 1 and sit there before the switch finally
     landed. Letting the child announce it keeps them exactly in step. */
  const advancePhase = useCallback(() => {
    setPhaseIndex((prev) => prev + 1); // modulo applied on read
  }, []);

  // Only hand the callback down when there's somewhere else to go. With a
  // single phase the child loops on its own instead.
  const handleCycleComplete = rotation.length > 1 ? advancePhase : undefined;

  /* Safety net only. If a child somehow never reports (an error mid-render,
     say), a shop-window screen must not freeze on one view forever. Sized
     well past the expected duration so it never fires during normal use —
     the event above always wins. */
  useEffect(() => {
    if (rotation.length <= 1) return;

    const expected =
      phase === "leaderboard"
        ? Math.max(1, leaderPageCount) * SLIDE_INTERVAL_MS
        : Math.max(
            1,
            phase === "google" ? googleReviews.length : reviews.length,
          ) *
            REVIEW_STEP_MS +
          REVIEW_TAIL_MS;

    const timer = setTimeout(advancePhase, expected * 2 + 10000);

    return () => clearTimeout(timer);
  }, [
    rotation.length,
    phase,
    phaseIndex,
    leaderPageCount,
    reviews.length,
    googleReviews.length,
    advancePhase,
  ]);

  const showingReviews = phase === "reviews" || phase === "google";

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = now
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  const selectedClass = useMemo(() => {
    if (!classes?.length) return null;

    const liveClass = classes.find((item) => {
      const timing = getClassTimingState(item.start, item.end, now);
      return timing.state === "live";
    });

    if (liveClass) return liveClass;

    const nextClass = classes.find((item) => {
      const timing = getClassTimingState(item.start, item.end, now);
      return timing.state === "scheduled";
    });

    return nextClass || null;
  }, [classes, now]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-3xl text-white">
        Loading today’s class schedule...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden p-2 text-white">
      <div className="grid h-full grid-cols-12 gap-2">
        <div className="col-span-2 flex h-full flex-col overflow-hidden rounded-lg bg-black/30 p-6 backdrop-blur-md max-[1750px]:px-4 py-2">
          {/* Header swaps with the view so the panel always says what it's
              showing. Deliberately NOT animated: an animation here creates a
              new stacking context, which changes how the panel's
              backdrop-blur samples and visibly shifts the leaderboard's
              colours. */}
          <div className="border-b border-white/50 pb-4 max-[1750px]:pb-2">
            {/* One <h2> serves both phases, so the size has to be per-phase —
                a single class here shrinks the leaderboard heading too.
                Both keep the board's max-[1750px] scaling: on the in-store
                screen that's 2xl for the leaderboard, lg for reviews. */}
            <h2
              className={`flex items-center gap-2 font-bold tracking-wide max-[1750px]:gap-1.5 ${
                showingReviews
                  ? "text-2xl max-[1750px]:text-[16px]"
                  : "text-4xl max-[1750px]:text-2xl"
              }`}
            >
              {phase === "google" && (
                <FcGoogle className="shrink-0" aria-label="Google" />
              )}
              {showingReviews ? REVIEWS_HEADING : leaderboardHeading}
            </h2>
            {/* Review phases have no subheading. Rendered conditionally
                rather than left empty — an empty <p> still reserves a line
                box, which left a gap under the review heading. Also covers
                the leaderboard having no subheading configured. */}
            {!showingReviews && leaderboardSubheading ? (
              <p className="mt-1 text-lg text-white/60 font-semibold max-[1750px]:text-sm">
                {leaderboardSubheading}
              </p>
            ) : null}
          </div>

          {/* Only the active phase is mounted, so each one restarts from the
              top of its own cycle every time it comes back on screen. Review
              data lives in the hooks above, so unmounting a carousel never
              interrupts its refresh.

              The `key` forces a fresh mount when switching between the two
              review sources, so the carousel resets to the first card instead
              of inheriting the previous source's scroll position.

              The leaderboard branch below is kept byte-identical to how it
              was before reviews existed — in particular it carries NO
              entrance animation. Its cards use backdrop-blur over very low
              alpha tier colours (bg-[#FFD70014] etc.), and wrapping them in
              an animated element creates a stacking context that changes
              what the blur samples, washing the colours out. */}
          {showingReviews ? (
            /* Review phases — safe to animate: plain bg-black/25 cards,
               no backdrop-blur to disturb */
            <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden max-[1750px]:mt-3">
              <ReviewsCarousel
                key={phase}
                reviews={phase === "google" ? googleReviews : reviews}
                stepMs={REVIEW_STEP_MS}
                tailMs={REVIEW_TAIL_MS}
                onCycleComplete={handleCycleComplete}
              />
            </div>
          ) : (
            /* UI 1 — leaderboard */
            <div className="mt-6 flex-1 overflow-hidden max-[1750px]:mt-3">
              {leaderLoading ? (
                <div className="text-white/70">Loading leaderboard...</div>
              ) : leaderError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300">
                  {leaderError}
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-white/70">No leaderboard data found</div>
              ) : (
                <SlidingLeaderboard
                  leaders={leaders}
                  milestones={milestones}
                  onPageCount={handleLeaderPageCount}
                  onCycleComplete={handleCycleComplete}
                />
              )}
            </div>
          )}
        </div>
        <div
          className={`absolute bottom-18 right-2 flex w-full justify-end ${
            isOnline ? "invisible" : ""
          }`}
          // style={{ width: qrSize }}
          aria-hidden={isOnline ? "true" : "false"}
          title={isOnline ? undefined : "No internet connection"}
        >
          <PiGlobeXBold className="text-red-500" />
        </div>
        <div className="col-span-10 flex h-full flex-col">
          <div className="flex h-35 max-[1750px]:h-18 justify-end rounded-lg backdrop-blur-md ">
            <div className="flex h-full w-full items-stretch justify-end">
              <div className="flex h-full items-center px-2">
                {!selectedClass ? (
                  <div className="flex h-full items-center justify-center text-2xl text-white/70">
                    No more classes today
                  </div>
                ) : (
                  <ClassCard key={selectedClass.id} item={selectedClass} />
                )}
              </div>

              <WeatherWidget
                temperature={weather.temperature}
                maxTemperature={weather.maxTemperature}
                minTemperature={weather.minTemperature}
                icon={weather.icon}
                label={weather.label}
                loading={weather.loading}
                error={weather.error}
              />

              <div className="ml-2 flex h-full min-w-[100px] flex-col items-end justify-center overflow-hidden rounded-lg border border-white/10 bg-black/10 px-6 py-4 text-right max-[1750px]:px-4">
                <div className="text-sm font-semibold text-white/60">
                  {currentDate}
                </div>
                <div className=" text-3xl font-bold tabular-nums text-white max-[1750px]:text-xl">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Quote section — temporarily replaced by the Score Poll widget.
              To bring it back: delete the Score Poll block below and
              uncomment this one. */}
          <div className="h-35 max-[1750px]:h-15">
            <QuotesSection quotes={quotes} />
          </div>
         

          {/* Score Poll widget — fills the same strip the quote section used. */}
          {/* <div className="h-35 max-[1750px]:h-15">
            <ScorePollWidget />
          </div> */}
        </div>
      </div>
    </div>
  );
}
