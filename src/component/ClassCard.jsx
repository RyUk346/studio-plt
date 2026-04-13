import { formatTime, getClassTimingState } from "../utils/date";

export default function ClassCard({ item, now }) {
  const timing = getClassTimingState(item.start, item.end, now);

  const badgeClasses =
    timing.state === "finished"
      ? "bg-white/10 text-white/70"
      : timing.state === "live"
        ? "bg-emerald-500/20 text-emerald-300"
        : "";

  return (
    <div className="flex h-full w-100 shrink-0 flex-col justify-center rounded-2xl border bg-white/5 border-white/10 px-5 py-2 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-bold text-white">
          {formatTime(item.start)}
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClasses}`}
        >
          {timing.label}
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold leading-tight text-white">
        {item.title}
      </div>

      <div className="mt-1 text-lg text-white/70">
        {item.instructor || "Instructor"}
      </div>
    </div>
  );
}
