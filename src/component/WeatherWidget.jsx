export default function WeatherWidget({
  temperature,
  icon,
  label,
  loading,
  error,
}) {
  return (
    <div className="flex h-full min-w-[120px] flex-col items-center justify-center rounded-lg border border-white/10 bg-black/10 px-4 py-4 text-center backdrop-blur-md max-[1750px]:min-w-[100px] max-[1750px]:px-3">
      {loading ? (
        <>
          <div className="text-2xl max-[1750px]:text-xl">🌡️</div>
          <div className="mt-1 text-lg font-semibold text-white max-[1750px]:text-sm">
            --°
          </div>
          <div className="text-xs text-white/60">Loading</div>
        </>
      ) : error ? (
        <>
          <div className="text-2xl max-[1750px]:text-xl">⚠️</div>
          <div className="mt-1 text-sm font-medium text-white/80">Weather</div>
          <div className="text-xs text-red-300">Unavailable</div>
        </>
      ) : (
        <>
          <div className="flex">
            <div className="text-3xl leading-none max-[1750px]:text-6xl">
              {icon}
            </div>
            <div>
              <div className="mt-1 text-2xl font-bold text-white max-[1750px]:text-xl">
                {temperature}°C
              </div>
              <div className="text-sm text-white/60 max-[1750px]:text-sm">
                {label}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
