import { formatTime, getClassTimingState } from "../utils/date";

export default function ClassCard({ item, now }) {
  const timing = getClassTimingState(item.start, item.end, now);

  const badgeClasses =
    timing.state === "finished"
      ? "bg-white/10 text-white/70"
      : timing.state === "live"
        ? "bg-emerald-500/20 text-emerald-300"
        : "bg-amber-500/20 text-amber-300";

  return (
    <div className="grid grid-cols-[220px_1fr_240px] items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-md">
      <div className="text-4xl font-bold tabular-nums text-white">
        {formatTime(item.start)}
      </div>

      <div>
        <div className="text-4xl font-semibold text-white">{item.title}</div>
        <div className="mt-1 text-2xl text-white/70">
          {item.instructor || "Instructor TBC"}
        </div>
      </div>

      <div className="text-right">
        <div
          className={`inline-block rounded-full px-4 py-2 text-xl font-semibold ${badgeClasses}`}
        >
          {timing.label}
        </div>
        <div className="mt-2 text-2xl text-white/60">
          {item.location || "Studio PLT"}
        </div>
      </div>
    </div>
  );
}
