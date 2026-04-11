import { useEffect, useState } from "react";
import ClassCard from "./ClassCard";
import useLeaderboard from "../hooks/useLeaderboard";
import useRoutine from "../hooks/useRoutine";

export default function ScheduleBoard() {
  const { classes, loading, error } = useRoutine();
  const {
    leaders,
    loading: leaderLoading,
    error: leaderError,
  } = useLeaderboard();

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

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
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
    <div className="min-h-screen w-screen p-2 text-white">
      <div className="grid min-h-[calc(100vh-48px)] grid-cols-3 gap-4">
        <div className="col-span-1 h-full rounded-3xl border border-white/10 bg-black/30 p-2 backdrop-blur-md">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold tracking-wide">Leaderboard</h2>
              <p className="mt-1 text-sm text-white/60">
                Top members by total visits
              </p>
            </div>

            <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
              {leaderLoading ? (
                <div className="text-white/70">Loading leaderboard...</div>
              ) : leaderError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300">
                  {leaderError}
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-white/70">No leaderboard data found</div>
              ) : (
                leaders.slice(0, 10).map((item) => {
                  const isFirst = item.rank === 1;
                  const isSecond = item.rank === 2;
                  const isThird = item.rank === 3;

                  const cardBg = isFirst
                    ? "bg-yellow-500/15 border-yellow-400/30 shadow-[0_0_25px_rgba(255,215,0,0.18)]"
                    : isSecond
                      ? "bg-slate-300/10 border-slate-300/30 shadow-[0_0_20px_rgba(200,200,200,0.12)]"
                      : isThird
                        ? "bg-orange-500/10 border-orange-400/30 shadow-[0_0_20px_rgba(205,127,50,0.16)]"
                        : "bg-white/5 border-white/10";

                  const rankBg = isFirst
                    ? "bg-yellow-400/30 text-black"
                    : isSecond
                      ? "bg-slate-300/30 text-black"
                      : isThird
                        ? "bg-orange-400/30 text-black"
                        : "bg-white/10 text-white";

                  const visitBg = isFirst
                    ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                    : isSecond
                      ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                      : isThird
                        ? "bg-orange-400/20 text-orange-300 border border-orange-400/30"
                        : "bg-white/10 text-white/70 border border-white/10";

                  return (
                    <div
                      key={item.rank}
                      className={`rounded-2xl border px-4 py-4 backdrop-blur-md ${cardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center gap-4">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${rankBg}`}
                          >
                            {item.rank === 1
                              ? "🥇"
                              : item.rank === 2
                                ? "🥈"
                                : item.rank === 3
                                  ? "🥉"
                                  : item.rank}
                          </div>
                          <div className="text-xl font-semibold leading-tight text-white">
                            {item.name}
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${visitBg}`}
                        >
                          {item.visits} visits
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 h-36 rounded-3xl border border-white/10 bg-black/25 p-2 backdrop-blur-md">
          <div className="flex h-full items-stretch gap-2">
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

            <div className="h-full flex-1 overflow-hidden justify-end">
              {visibleClasses.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-center text-white/70">
                  No classes today
                </div>
              ) : (
                <div className="hide-scrollbar h-full overflow-x-auto overflow-y-hidden">
                  <div className="flex h-full gap-2 pr-2 justify-end">
                    {visibleClasses.map((item) => (
                      <ClassCard key={item.id} item={item} now={now} />
                    ))}
                  </div>
                </div>
              )}
            </div>

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
