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
import StudioReviews from "./StudioReviews";
import useReviews from "../hooks/useReviews";
import { getClassTimingState } from "../utils/date";
import WeatherWidget from "./WeatherWidget";
import useWeather from "../hooks/useWeather";
import { PiGlobeXBold } from "react-icons/pi";

/* Side-panel loop timings.
   UI 1 = leaderboard, UI 2 = member reviews. Each view stays on screen just
   long enough to play through its own content once, then hands over. */
const REVIEW_STEP_MS = 6000; // pause per review card
const REVIEW_TAIL_MS = 2500; // rest on the last review before handing back

const REVIEWS_HEADING = "Member Reviews";
const REVIEWS_SUBHEADING = "What our community is saying";

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

  /* ── Side panel: leaderboard ⇄ reviews loop ──────────────────────────
     `view` is which UI the left column is showing. Each view's duration is
     derived from its own content so nothing gets cut off mid-cycle:
       - leaderboard → one full pass of its pages
       - reviews     → one step per review, plus a short rest at the end
     If either side has nothing to show, the panel simply parks on the
     other one and stops looping. */
  const [view, setView] = useState("leaderboard");
  // Starts at 1, not 0, on purpose. SlidingLeaderboard only reports its page
  // count while it's mounted, so if the panel ever parks on reviews before
  // the leaderboard has rendered once, a 0 here would keep hasLeaderboard
  // false forever and the loop could never come back.
  const [leaderPageCount, setLeaderPageCount] = useState(1);

  // Stable identity so SlidingLeaderboard's reporting effect doesn't re-fire
  // on every board re-render (this component ticks once per second).
  const handleLeaderPageCount = useCallback((count) => {
    setLeaderPageCount(count);
  }, []);

  const hasReviews = reviews.length > 0;
  const hasLeaderboard =
    !leaderLoading && !leaderError && leaders.length > 0 && leaderPageCount > 0;

  // Only alternate when BOTH sides have something to show — otherwise the
  // panel parks on whichever one does. Derived rather than stored, so the
  // loop can't get stuck on an empty view.
  const canAlternate = hasReviews && hasLeaderboard;
  const showingReviews = hasReviews && (!hasLeaderboard || view === "reviews");

  useEffect(() => {
    if (!canAlternate) return;

    const duration = showingReviews
      ? reviews.length * REVIEW_STEP_MS + REVIEW_TAIL_MS
      : Math.max(1, leaderPageCount) * SLIDE_INTERVAL_MS;

    const timer = setTimeout(() => {
      setView((prev) => (prev === "reviews" ? "leaderboard" : "reviews"));
    }, duration);

    return () => clearTimeout(timer);
  }, [canAlternate, showingReviews, leaderPageCount, reviews.length]);

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
            <h2 className="text-4xl font-bold tracking-wide max-[1750px]:text-2xl">
              {showingReviews ? REVIEWS_HEADING : leaderboardHeading}
            </h2>
            <p className="mt-1 text-lg text-white/60 font-semibold max-[1750px]:text-sm">
              {showingReviews ? REVIEWS_SUBHEADING : leaderboardSubheading}
            </p>
          </div>

          {/* Only the active view is mounted, so each one restarts from the
              top of its own cycle every time it comes back on screen. The
              review data lives in useReviews above, so unmounting the
              carousel never interrupts its hourly refresh.

              The leaderboard branch below is kept byte-identical to how it
              was before reviews existed — in particular it carries NO
              entrance animation. Its cards use backdrop-blur over very low
              alpha tier colours (bg-[#FFD70014] etc.), and wrapping them in
              an animated element creates a stacking context that changes
              what the blur samples, washing the colours out. */}
          {showingReviews ? (
            /* UI 2 — member reviews (safe to animate: plain bg-black/25
               cards, no backdrop-blur to disturb) */
            <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden max-[1750px]:mt-3">
              <StudioReviews reviews={reviews} stepMs={REVIEW_STEP_MS} />
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
