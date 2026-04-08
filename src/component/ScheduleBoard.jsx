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

  const currentTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
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
    <div className="flex min-h-screen w-screen items-center justify-center text-white">
      {/* Centered container */}
      <div className="w-full max-w-480 px-6">
        {/* Header */}
        <header className="mb-8 rounded-3xl border border-white/10 bg-black/30 p-6  backdrop-blur-md flex justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-wide">STUDIO PLT</h1>
            <p className="mt-2 text-lg text-white/70">Today’s class schedule</p>
          </div>

          <div className="mt-4">
            <div className="text-lg text-white/80">{currentDate}</div>
            <div className="text-3xl font-bold tabular-nums">{currentTime}</div>
          </div>
        </header>

        {/* Classes */}
        {classes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center text-2xl text-white/70 backdrop-blur-md">
            No classes scheduled for today
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((item) => (
              <ClassCard key={item.id} item={item} now={now} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
