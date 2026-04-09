export const isToday = (dateString) => {
  const now = new Date();
  const target = new Date(dateString);

  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
};

export const isClassFinished = (endString, now = new Date()) => {
  return new Date(endString) <= now;
};

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

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
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
