import { formatTime, getClassTimingState } from "../utils/date";
import useNow from "../hooks/useNow";

export default function ClassCard({ item, forceShowBadge = false }) {
  const now = useNow();
  const timing = getClassTimingState(item.start, item.end, now);

  const isLive = timing.state === "live";
  const badgeClasses = isLive
    ? "bg-emerald-300/30 text-emerald-300"
    : " text-amber-300";

  return (
    <div className="flex h-full w-[274px] flex-shrink-0 flex-col justify-center rounded-lg border border-white/10 bg-black/30 px-4 py-1 backdrop-blur-md">
      <div className="flex items-center justify-between gap-0">
        <div className="max-[1750px]:text-sm text-lg font-bold text-white">
          {formatTime(item.start)}
        </div>
        {(isLive || forceShowBadge) && (
          <div
            className={`rounded-full px-3 py-0.5 -mt-1 text-xs font-medium ${badgeClasses}`}
          >
            {timing.label}
          </div>
        )}
      </div>

      {/* Sliding Title Container */}
      <div className="max-[1750px]:mt-0 mt-3 overflow-hidden">
        <div className="max-[1750px]:text-sm text-xl font-semibold leading-tight text-white ">
          <div className="inline-block ">{item.title}</div>
        </div>
      </div>

      <div className="max-[1750px]:mt-0 mt-1 text-sm text-white/70 truncate">
        {item.instructor || "Instructor"}
      </div>
    </div>
  );
}
