import { useEffect, useState } from "react";
import useSchedule from "../hooks/useSchedule";
import ClassCard from "./ClassCard";

export default function ScheduleBoard() {
  const { classes, loading, error } = useSchedule();
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
      <div className="grid min-h-[calc(100vh-48px)] grid-cols-4 gap-6">
        {/* Left 1/3 - Leaderboard */}
        <div className="col-span-1 h-full rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold tracking-wide">Leaderboard</h2>
              <p className="mt-1 text-sm text-white/60">Top performers</p>
            </div>

            <div className="mt-6 flex-1 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-white/50">1st Place</div>
                <div className="mt-1 text-2xl font-semibold">Ava</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-white/50">2nd Place</div>
                <div className="mt-1 text-2xl font-semibold">Sophia</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-white/50">3rd Place</div>
                <div className="mt-1 text-2xl font-semibold">Mia</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-white/50">4th Place</div>
                <div className="mt-1 text-2xl font-semibold">Ella</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-white/50">5th Place</div>
                <div className="mt-1 text-2xl font-semibold">Grace</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2/3 - Routine */}
        <div className="col-span-3 h-40 rounded-3xl border border-white/10 bg-black/25 p-3 backdrop-blur-md">
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
            <div className="h-full flex-1 overflow-hidden">
              {classes.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                  No classes today
                </div>
              ) : (
                <div className="h-full overflow-x-auto overflow-y-hidden">
                  <div className="flex h-full gap-4 pr-2">
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
