import { formatTime, getClassTimingState } from "../utils/date";
import useNow from "../hooks/useNow";

export default function ClassCard({ item, forceShowBadge = false }) {
  const now = useNow();
  const timing = getClassTimingState(item.start, item.end, now);

  const isLive = timing.state === "live";

  // Define colors based on state
  const badgeClasses = isLive
    ? "bg-emerald-500/20 text-emerald-300"
    : "bg-amber-500/20 text-amber-300";

  return (
    <div className="flex h-full w-[280px] flex-shrink-0 flex-col justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="max-[1750px]:text-sm text-lg font-bold text-white">
          {formatTime(item.start)}
        </div>

        {/* Show badge if the class is LIVE OR if the parent says this class is "Next Up" */}
        {(isLive || forceShowBadge) && (
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClasses}`}
          >
            {timing.label}
          </div>
        )}
      </div>

      <div className="max-[1750px]:mt-0.5 mt-3 max-[1750px]:text-lg text-xl font-semibold leading-tight text-white">
        {item.title}
      </div>

      <div className="max-[1750px]:mt-0.5 mt-1 text-sm text-white/70">
        {item.instructor || "Instructor"}
      </div>
    </div>
  );
}
