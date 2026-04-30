import { formatTime, getClassTimingState } from "../utils/date";
import useNow from "../hooks/useNow";

export default function ClassCard({ item }) {
  const now = useNow();
  const timing = getClassTimingState(item.start, item.end, now);
  const isLive = timing.state === "live";

  const statusText = isLive ? "Class in Progress" : "Next Class";
  const statusColor = isLive ? "" : "";
  const statusBg = isLive
    ? "text-[#B01E00] bg-white/40"
    : "text-[#445A03] bg-green-300/40";
  const cardBg = isLive ? "bg-[#B01E00]/50 " : "bg-[#445A03]/50";

  return (
    <div className={`flex text-re h-full  flex-shrink-0 px-2 flex-col justify-center ${cardBg} rounded-lg   py-1 backdrop-blur-md`}>
      <div className="flex items-center justify-between gap-6">
        <div className="text-lg font-bold text-white max-[1750px]:text-sm">
          {formatTime(item.start)}
        </div>
        
      </div>

      <div
        className={` flex gap-1 items-center mt-2 text-lg font-semibold leading-tight max-[1750px]:mt-1 max-[1750px]:text-sm ${statusColor}`}
      >
        <div className="">{statusText}</div>

        <div className={`px-2 rounded-xl py-1 ${statusBg}`}>{timing.label}</div>
      </div>

     
    </div>
  );
}
