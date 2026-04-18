import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = window.innerWidth <= 1750 ? 8 : 10;
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
  const [animateCards, setAnimateCards] = useState(true);

  useEffect(() => {
    if (pages.length <= 1) return;

    const interval = setInterval(() => {
      setAnimateCards(false);

      setTimeout(() => {
        setPageIndex((prev) => (prev + 1) % pages.length);
        setAnimateCards(true);
      }, 100);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pages.length]);

  useEffect(() => {
    setAnimateCards(false);

    const timeout = setTimeout(() => {
      setAnimateCards(true);
    }, 80);

    return () => clearTimeout(timeout);
  }, [pageIndex]);

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${pageIndex * 100}%)` }}
      >
        {pages.map((page, idx) => (
          <div key={idx} className="h-full max-[1750px]:space-y-1 space-y-3">
            {page.map((item, itemIndex) => {
              const isFirst = item.rank === 1;
              const isSecond = item.rank === 2;
              const isThird = item.rank === 3;

              const cardBg = isFirst
                ? "bg-white/30 border-white/20"
                : isSecond
                  ? "bg-white/50 border-white/20"
                  : isThird
                    ? "bg-white/30 border-white/20"
                    : "bg-white/50 border-white/20";

              const rankBg = isFirst
                ? "bg-[#FFB300] text-black"
                : isSecond
                  ? "bg-[#C0C0C0] text-black"
                  : isThird
                    ? "bg-[#CD7F32] text-black"
                    : "bg-white/10 text-white";

              const visitBg = isFirst
                ? "bg-[#C0C0C010] text-yellow-300 border border-yellow-400/30"
                : isSecond
                  ? "bg-[#C0C0C020] text-slate-200 border border-slate-300/30"
                  : isThird
                    ? "bg-[#CD7F3240] text-orange-300 border border-orange-400/30"
                    : "bg-white/10 text-white/70 border border-white/10";

              const isActivePage = idx === pageIndex;

              return (
                <div
                  key={`${item.rank}-${item.name}`}
                  className={`rounded-2xl border px-4 max-[1750px]:py-2 py-4 backdrop-blur-md transition-all duration-700 ease-out ${cardBg} ${
                    isActivePage && animateCards
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-16 opacity-0"
                  }`}
                  style={{
                    transitionDelay:
                      isActivePage && animateCards
                        ? `${itemIndex * 180}ms`
                        : "0ms",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-4 justify-center items-center">
                      <div
                        className={`flex max-[1750px]:h-5 max-[1750px]:w-5 h-9 w-9 items-center justify-center rounded-full max-[1750px]:text-xs text-lg font-semibold ${rankBg}`}
                      >
                        {item.rank === 1
                          ? "🥇"
                          : item.rank === 2
                            ? "🥈"
                            : item.rank === 3
                              ? "🥉"
                              : item.rank}
                      </div>

                      <div className="max-[1750px]:text-lg max-[1750px]:font-medium text-2xl font-semibold leading-tight text-white">
                        {item.name}
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-lg max-[1750px]:text-xs ${visitBg}`}
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
