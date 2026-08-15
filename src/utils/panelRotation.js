/* ──────────────────────────────────────────────────────────────────────────
   Side-panel rotation order.

   The board cycles the left column through:

     leaderboard → member reviews → leaderboard → Google reviews → (repeat)

   The leaderboard appears twice on purpose, so it gets roughly half the
   airtime and each review source is separated by it.

   Pure function, kept out of the component so the awkward cases (a source
   with no content yet, only one source available, nothing available) can be
   tested directly.
   ────────────────────────────────────────────────────────────────────────── */
export const FULL_CYCLE = ["leaderboard", "reviews", "leaderboard", "google"];

/**
 * Build the phase sequence for whatever content actually exists.
 *
 * @param {{leaderboard?: boolean, reviews?: boolean, google?: boolean}} available
 * @returns {string[]} phases to cycle through; [] when there's nothing to show
 */
export function buildRotation(available = {}) {
  const present = FULL_CYCLE.filter((phase) => available[phase]);

  // Drop back-to-back repeats — with only the leaderboard available the raw
  // filter yields ["leaderboard", "leaderboard"], which would pointlessly
  // remount the same view twice per cycle.
  const collapsed = present.filter((phase, i) => phase !== present[i - 1]);

  // The sequence loops, so the last phase sits next to the first. If they
  // match (e.g. ["leaderboard", "reviews", "leaderboard"] when Google has
  // nothing), drop the tail so the leaderboard doesn't run twice in a row
  // across the wrap.
  if (
    collapsed.length > 1 &&
    collapsed[0] === collapsed[collapsed.length - 1]
  ) {
    collapsed.pop();
  }

  return collapsed;
}
