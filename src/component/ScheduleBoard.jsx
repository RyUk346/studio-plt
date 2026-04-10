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
    <div className="min-h-screen w-screen text-white">
      {/* Top-aligned container */}
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        {/* Header */}
        <header className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-wide">STUDIO PLT</h1>
              <p className="mt-1 text-sm text-white/70">
                Today’s class schedule
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/70">{currentDate}</div>
              <div className="text-2xl font-bold tabular-nums">
                {currentTime}
              </div>
            </div>
          </div>
        </header>

        {/* One column list */}
        <div className="overflow-x-auto w-full">
          <div className="flex gap-4">
            {classes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-white/70">
                No classes today
              </div>
            ) : (
              classes.map((item) => (
                <ClassCard key={item.id} item={item} now={now} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
