export const formatTime = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0 && seconds < 60) {
    return "<1m"; // Show <1m if the time is less than 1 minute
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m `;
  }

  return `${minutes}m `;
};

export const getClassTimingState = (
  startString,
  endString,
  now = new Date(),
) => {
  const start = new Date(startString);
  const end = new Date(endString);

  if (now < start) {
    return {
      state: "scheduled",
      label: `Starts in ${formatDuration(start - now)}`,
    };
  }

  if (now >= start && now < end) {
    return {
      state: "live",
      label: `Ends in ${formatDuration(end - now)}`,
    };
  }

  return {
    state: "finished",
    label: "Finished",
  };
};
