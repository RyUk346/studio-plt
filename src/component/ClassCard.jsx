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
    <div className="min-w-[320px] flex-shrink-0 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-white">
          {formatTime(item.start)}
        </div>

        <div className={`rounded-full px-3 py-1 text-xs ${badgeClasses}`}>
          {timing.label}
        </div>
      </div>

      <div className="mt-2 text-lg font-semibold text-white">{item.title}</div>

      <div className="mt-1 text-sm text-white/70">
        {item.instructor || "Instructor"}
      </div>
    </div>
  );
}
