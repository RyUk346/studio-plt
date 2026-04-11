import { useEffect, useState } from "react";
import useSchedule from "../hooks/useSchedule";
import ClassCard from "./ClassCard";
import useLeaderboard from "../hooks/useLeaderboard";

export default function ScheduleBoard() {
  const { classes, loading, error } = useSchedule();
  const [now, setNow] = useState(new Date());
  const {
    leaders,
    loading: leaderLoading,
    error: leaderError,
  } = useLeaderboard();

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

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-3xl text-white">
        Refreshing today’s class schedule...
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
    <div className="min-h-screen w-screen p-2 text-white">
      <div className="grid min-h-[calc(100vh-48px)] grid-cols-4 gap-2">
        {/* Left 1/3 - Leaderboard */}
        <div className="col-span-1 h-full rounded-3xl border border-white/10 bg-black/30 p-2 backdrop-blur-md">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold tracking-wide">Leaderboard</h2>
              <p className="mt-1 text-sm text-white/60">
                Top members by total visits
              </p>
            </div>

            <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
              {leaderLoading ? (
                <div className="text-white/70">Loading leaderboard...</div>
              ) : leaderError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300">
                  {leaderError}
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-white/70">No leaderboard data found</div>
              ) : (
                leaders.slice(0, 10).map((item) => (
                  <div
                    key={item.rank}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/50">#{item.rank}</div>
                      <div className="text-sm text-white/50">
                        {item.visits} visits
                      </div>
                    </div>

                    <div className="mt-2 text-2xl font-semibold text-white">
                      {item.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 2/3 - Routine */}
        <div className="col-span-3 h-40 rounded-3xl border border-white/10 bg-black/25 p-2 backdrop-blur-md">
          <div className="flex h-full items-stretch gap-4">
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
            <div className="h-full flex-1 overflow-hidden ">
              {classes.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                  No classes today
                </div>
              ) : (
                <div className="h-full overflow-x-auto overflow-y-hidden ">
                  <div className="flex h-full gap-4 pr-2 justify-end">
                    {classes.map((item) => (
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
      </div>
    </div>
  );
}
