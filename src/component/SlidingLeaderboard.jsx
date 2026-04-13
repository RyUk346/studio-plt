import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;
const SLIDE_INTERVAL_MS = 10000;

export default function SlidingLeaderboard({ leaders }) {
  const pages = useMemo(() => {
    const chunks = [];

    for (let i = 0; i < leaders.length; i += ITEMS_PER_PAGE) {
      chunks.push(leaders.slice(i, i + ITEMS_PER_PAGE));
    }

    return chunks;
  }, [leaders]);

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (pages.length <= 1) return;

    const interval = setInterval(() => {
      setPageIndex((prev) => (prev + 1) % pages.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pages.length]);

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${pageIndex * 100}%)` }}
      >
        {pages.map((page, idx) => (
          <div key={idx} className="h-full space-y-3">
            {page.map((item) => {
              const isFirst = item.rank === 1;
              const isSecond = item.rank === 2;
              const isThird = item.rank === 3;

              const cardBg = isFirst
                ? "bg-yellow-500/15 border-yellow-400/30 shadow-[0_0_25px_rgba(255,215,0,0.18)]"
                : isSecond
                  ? "bg-slate-300/10 border-slate-300/30 shadow-[0_0_20px_rgba(200,200,200,0.12)]"
                  : isThird
                    ? "bg-orange-500/10 border-orange-400/30 shadow-[0_0_20px_rgba(205,127,50,0.16)]"
                    : "bg-white/5 border-white/10";

              const rankBg = isFirst
                ? "bg-yellow-400 text-black"
                : isSecond
                  ? "bg-slate-300 text-black"
                  : isThird
                    ? "bg-orange-400 text-black"
                    : "bg-white/10 text-white";

              const visitBg = isFirst
                ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                : isSecond
                  ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                  : isThird
                    ? "bg-orange-400/20 text-orange-300 border border-orange-400/30"
                    : "bg-white/10 text-white/70 border border-white/10";

              return (
                <div
                  key={`${item.rank}-${item.name}`}
                  className={`rounded-2xl border px-4 py-4 backdrop-blur-md ${cardBg}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-4 justify-center items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold ${rankBg}`}
                      >
                        {item.rank === 1
                          ? "🥇"
                          : item.rank === 2
                            ? "🥈"
                            : item.rank === 3
                              ? "🥉"
                              : item.rank}
                      </div>
                      <div className="text-2xl font-semibold leading-tight text-white">
                        {item.name}
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-lg font-lg ${visitBg}`}
                    >
                      {item.visits} visits
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
