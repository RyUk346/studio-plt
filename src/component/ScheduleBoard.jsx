import { useState, useEffect } from "react";
import useRoutine from "../hooks/useRoutine";
import ClassCard from "./ClassCard";
import SlidingLeaderboard from "./SlidingLeaderboard";
import useLeaderboard from "../hooks/useLeaderboard";
import useQuotes from "../hooks/useQuotes";
import QuotesSection from "./QuotesSection";
import { getClassTimingState } from "../utils/date"; // Ensure this path is correct

export default function ScheduleBoard() {
  const { classes, loading, error } = useRoutine();
  const {
    leaders,
    heading: leaderboardHeading,
    subheading: leaderboardSubheading,
    loading: leaderLoading,
    error: leaderError,
  } = useLeaderboard();
  const { quotes } = useQuotes();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every second to ensure the "Live" transition is snappy
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

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // --- Logic to handle Countdown Handover ---
  let countdownIndex = 0;
  if (classes && classes.length > 0) {
    const firstClassTiming = getClassTimingState(
      classes[0].start,
      classes[0].end,
      now,
    );
    // If the first class is already LIVE, set the countdown badge to the NEXT class (index 1)
    if (firstClassTiming.state === "live" && classes.length > 1) {
      countdownIndex = 1;
    }
  }

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
      <div className="grid h-full grid-cols-5 gap-4">
        {/* LEFT: LEADERBOARD */}
        <div className="col-span-1 flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 max-[1750px]:p-4 p-6 backdrop-blur-md">
          <div className="border-b border-white/50 max-[1750px]:pb-2 pb-4">
            <h2 className="max-[1750px]:text-2xl text-4xl font-bold tracking-wide">
              {leaderboardHeading || "Leaderboard"}
            </h2>
            <p className="mt-1 text-lg text-white/60">
              {leaderboardSubheading || "Top members by total visits"}
            </p>
          </div>

          <div className="max-[1750px]:mt-4 mt-6 flex-1 overflow-hidden">
            {leaderLoading ? (
              <div className="text-white/70">Loading leaderboard...</div>
            ) : leaderError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300">
                {leaderError}
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-white/70">No leaderboard data found</div>
            ) : (
              <SlidingLeaderboard leaders={leaders} />
            )}
          </div>
        </div>

        {/* RIGHT: TOP ROUTINE + BOTTOM QUOTES */}
        <div className="max-[1750px]:col-span-4 col-span-4 flex h-full flex-col">
          {/* TOP: ROUTINE */}
          <div className="max-[1750px]:h-25 h-35 rounded-3xl border  p-2 backdrop-blur-md flex justify-end">
            <div className="flex h-full items-stretch gap-2 w-full">
              <div className="h-full flex-1 overflow-hidden">
                {classes.length === 0 ? (
                  <div className="flex h-full w-full items-center max-[1750px]:text-lg text-2xl font-medium justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-white/70">
                    No more classes today
                  </div>
                ) : (
                  <div className="hide-scrollbar h-full overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full flex-row-reverse items-center max-[1750px]:gap-2 gap-4 px-2">
                      {classes.map((item, index) => (
                        <ClassCard
                          key={item.id}
                          item={item}
                          // Pass countdown if it's the calculated index
                          // OR handle the "Live" state inside ClassCard as well
                          showCountdown={index === countdownIndex}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time + Date Section */}
              <div className="flex h-full min-w-[100px] flex-col items-end justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 max-[1750px]:px-4 px-6 py-4 text-right">
                <div className="text-sm text-white/60">{currentDate}</div>
                <div className="mt-2 max-[1750px]:text-xl text-3xl font-bold tabular-nums text-white">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* BOTTOM: QUOTES */}
          <div className="max-[1750px]:h-20 h-35">
            <QuotesSection quotes={quotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
