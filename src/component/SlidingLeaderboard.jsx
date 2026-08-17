import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 9;
// Exported so the board can keep UI 1 on screen for exactly one full
// leaderboard cycle before looping to UI 2 (reviews).
export const SLIDE_INTERVAL_MS = 10000;

function capitalize(word = "") {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatMemberName(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";

  if (parts.length === 1) {
    return capitalize(parts[0]);
  }

  const firstName = capitalize(parts[0]);
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";

  return `${firstName} ${lastInitial}`;
}

function getTier(visits = 0, milestones = {}) {
  const count = Number(visits) || 0;

  const gold = Number(milestones.gold || 40);
  const silver = Number(milestones.silver || 25);
  const bronze = Number(milestones.bronze || 10);

  if (count >= gold) {
    return {
      label: `${gold}+ Club`,
      cardBg: "border-white/20 bg-[#FFD70014]",
      badgeBg: "bg-[#FFD70040] text-yellow-300 border border-yellow-400/30",
      textColor: "text-[#FFD700]",
    };
  }

  if (count >= silver) {
    return {
      label: `${silver}+ Club`,
      cardBg: "border-white/20 bg-[#C0C0C014]",
      badgeBg: "bg-[#C0C0C040] text-slate-50 border border-slate-300/30",
      textColor: "text-slate-50",
    };
  }

  if (count >= bronze) {
    return {
      label: `${bronze}+ Club`,
      cardBg: "border-white/20 bg-[#CD7F3214]",
      badgeBg: "bg-[#CD7F3240] text-orange-300 border border-orange-400/30",
      textColor: "text-[#CD7F32]",
    };
  }

  return {
    label: `${bronze}+ Club`,
    cardBg: "border-white/20 bg-[#CD7F3214]",
    badgeBg: "bg-[#CD7F3240] text-orange-300 border border-orange-400/30",
    textColor: "text-[#CD7F32]",
};
}

/* Props:
   - onCycleComplete → fired once every page has had its full turn on screen.
                       This is what hands control back to the board, rather
                       than the board guessing the duration. Omit it and the
                       leaderboard just loops on its own.
   - onPageCount     → number of pages, used only for the board's safety
                       timeout. Not used for the handoff itself.

   The board unmounts this component while a reviews phase is showing, so
   paging pauses and restarts from page 1 when it comes back. */
export default function SlidingLeaderboard({
  leaders,
  milestones,
  onPageCount,
  onCycleComplete,
}) {
  const pages = useMemo(() => {
    const chunks = [];

    const bronze = Number(milestones?.bronze || 10);

const clubMembers = leaders.filter((item) => {
  const visits = Number(item.visits || 0);
  return visits >= bronze;
});

for (let i = 0; i < clubMembers.length; i += ITEMS_PER_PAGE) {
  chunks.push(clubMembers.slice(i, i + ITEMS_PER_PAGE));
}

    return chunks;
  }, [leaders, milestones]);

  const [pageIndex, setPageIndex] = useState(0);
  // Starts false so the cards slide in on mount. Starting true would render
  // them in their final position for one frame before the entrance effect
  // below yanked them back off-screen — a visible flash each time the
  // leaderboard comes back on screen.
  const [animateCards, setAnimateCards] = useState(false);

  /* The member list is live — useLeaderboard re-polls every 60s, so pages can
     appear or disappear while this component is on screen.

     Growing is handled naturally: pages.length is a dependency of the advance
     effect below, so a longer list simply means more pages to get through
     before we hand over.

     Shrinking needs this clamp. If the list drops from 4 pages to 2 while
     we're showing page 4, the track would scroll to -300% with only two pages
     rendered and the panel would go blank. Derived rather than stored so
     there's no extra render pass. */
  const safePageIndex = pages.length
    ? Math.min(pageIndex, pages.length - 1)
    : 0;

  // Let the board size its safety timeout to the number of pages.
  useEffect(() => {
    onPageCount?.(pages.length);
  }, [pages.length, onPageCount]);

  /* Page advance, one timer per page rather than a free-running interval.
     When the LAST page has had its full turn we report upwards instead of
     wrapping, so the board can hand over to the next phase at exactly the
     moment the leaderboard finishes. Previously the board predicted this
     with `pageCount × SLIDE_INTERVAL_MS`; that clock and this one drifted,
     so the leaderboard sometimes wrapped back to page 1 and sat there
     before the switch finally landed. */
  useEffect(() => {
    if (!pages.length) return;

    const timer = setTimeout(() => {
      const isLastPage = safePageIndex >= pages.length - 1;

      if (isLastPage) {
        // Board is driving a rotation → hand back. Otherwise loop forever,
        // which is what this component does when used on its own.
        if (onCycleComplete) {
          onCycleComplete();
          return;
        }
        setAnimateCards(false);
        setTimeout(() => setPageIndex(0), 100);
        return;
      }

      setAnimateCards(false);
      setTimeout(() => setPageIndex(safePageIndex + 1), 100);
    }, SLIDE_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [safePageIndex, pages.length, onCycleComplete]);

  useEffect(() => {
    setAnimateCards(false);

    const timeout = setTimeout(() => {
      setAnimateCards(true);
    }, 80);

    return () => clearTimeout(timeout);
  }, [safePageIndex]);

  return (
    <div className="relative h-full  mt-1 overflow-hidden">
      <div
        className="h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${safePageIndex * 100}%)` }}
      >
        {pages.map((page, idx) => (
          <div key={idx} className="h-full space-y-3 max-[1750px]:space-y-1">
            {page.map((item, itemIndex) => {
              const tier = getTier(item.visits, milestones);
              const isActivePage = idx === safePageIndex;

              return (
                <div
                  key={`${item.name}-${item.visits}`}
                  className={`rounded-2xl flex flex-col justify-center border px-4 py-4 backdrop-blur-md transition-all duration-700 ease-out max-[1750px]:py-2 ${tier.cardBg} ${
                    isActivePage && animateCards
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay:
                      isActivePage && animateCards
                        ? `${itemIndex * 180}ms`
                        : "0ms",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`text-2xl font-semibold leading-tight max-[1750px]:text-lg max-[1750px]:font-medium ${tier.textColor}`}
                    >
                      {formatMemberName(item.name)}
                    </div>

                    <div
                      className={`rounded-full px-3 py-0.5 text-lg max-[1750px]:text-xs ${tier.badgeBg}`}
                    >
                      {tier.label}
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
