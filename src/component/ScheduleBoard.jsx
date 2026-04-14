import { useEffect, useState } from "react";
import ClassCard from "./ClassCard";
import useLeaderboard from "../hooks/useLeaderboard";
import useRoutine from "../hooks/useRoutine";
import SlidingLeaderboard from "./SlidingLeaderboard";
import useQuotes from "../hooks/useQuotes";
import QuotesSection from "./QuotesSection";

export default function ScheduleBoard() {
  const { classes, loading, error } = useRoutine();
  const {
    leaders,
    heading: leaderboardHeading,
    subheading: leaderboardSubheading,
    loading: leaderLoading,
    error: leaderError,
  } = useLeaderboard();

  const [now, setNow] = useState(new Date());
  const { quotes } = useQuotes();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 6000000);

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

  const visibleClasses = classes.filter((item) => new Date(item.end) > now);

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
        {/* LEFT: LEADERBOARD - FULL HEIGHT */}
        <div className="col-span-1 flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
          <div className="border-b border-white/50 pb-4">
            <h2 className="text-4xl font-bold tracking-wide">
              {leaderboardHeading || "Leaderboard"}
            </h2>
            <p className="mt-1 text-lg text-white/60">
              {leaderboardSubheading || "Top members by total visits"}
            </p>
          </div>

          <div className="mt-6 flex-1 overflow-hidden">
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
        <div className="col-span-4 flex h-full flex-col ">
          {/* TOP: ROUTINE */}
          <div className="h-35 rounded-3xl border border-white/10 bg-black/25 p-2 backdrop-blur-md flex justify-end">
            <div className="flex h-full items-stretch gap-2">
              {/* Logo + Title */}
              {/* <div className="flex h-full min-w-[220px] flex-col items-start justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                <div>
                  <video
                    className="mb-4 -ml-20 h-16 w-80 object-contain drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/PLT_Logo.webm" type="video/webm" />
                  </video>
                </div>

                <div className="mt-2 text-3xl font-bold leading-tight">
                  Class Routine
                </div>
              </div> */}

              {/* Routine */}
              <div className="h-full flex-1 overflow-hidden">
                {visibleClasses.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                    No classes today
                  </div>
                ) : (
                  <div className="hide-scrollbar h-full overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full gap-4 pr-2">
                      {[...visibleClasses].reverse().map((item) => (
                        <ClassCard key={item.id} item={item} now={now} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time + Date */}
              <div className="flex h-full min-w-[220px] flex-col items-end justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-right">
                <div className="text-sm text-white/60">{currentDate}</div>
                <div className="mt-2 text-3xl font-bold tabular-nums">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="h-35">
            <QuotesSection quotes={quotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
