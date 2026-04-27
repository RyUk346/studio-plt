import { formatTime, getClassTimingState } from "../utils/date";
import useNow from "../hooks/useNow";

export default function ClassCard({ item }) {
  const now = useNow();
  const timing = getClassTimingState(item.start, item.end, now);
  const isLive = timing.state === "live";

  const statusText = isLive ? "Class in progress" : "Next class";
  const statusColor = isLive ? "" : "";
  const statusBg = isLive
    ? "text-red-700 bg-red-300/40"
    : "text-green-400 bg-green-300/40";

  return (
    <div className="flex text-re h-full  flex-shrink-0 px-2 flex-col justify-center rounded-lg border border-white/10 bg-black/30 py-1 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-white max-[1750px]:text-sm">
          {formatTime(item.start)}
        </div>
      </div>

      <div
        className={` flex gap-1 items-center mt-2 text-lg font-semibold leading-tight max-[1750px]:mt-1 max-[1750px]:text-sm ${statusColor}`}
      >
        {statusText}
        <div className={`px-2 rounded-xl py-1 ${statusBg}`}>{timing.label}</div>
      </div>

      <div className={`mt-1 text-sm font-medium `}></div>
    </div>
  );
}
