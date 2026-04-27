import { useEffect, useState } from "react";

const lat = import.meta.env.VITE_WEATHER_LAT;
const lon = import.meta.env.VITE_WEATHER_LON;

const WEATHER_API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

function getWeatherMeta(code, temp) {
  const temperature = Number(temp);

  if (code === 0) {
    if (temperature >= 30) {
      return { icon: "☀️", label: "Sunny" };
    }
    return { icon: "🌤️", label: "Clear" };
  }

  if ([1, 2].includes(code)) {
    return { icon: "⛅", label: "Partly cloudy" };
  }

  if (code === 3) {
    return { icon: "☁️", label: "Cloudy" };
  }

  if ([45, 48].includes(code)) {
    return { icon: "🌫️", label: "Fog" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { icon: "🌦️", label: "Drizzle" };
  }

  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return { icon: "🌧️", label: "Rain" };
  }

  if ([66, 67].includes(code)) {
    return { icon: "🌨️", label: "Freezing rain" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { icon: "❄️", label: "Snow" };
  }

  if ([95, 96, 99].includes(code)) {
    return { icon: "⛈️", label: "Thunderstorm" };
  }

  return { icon: "🌡️", label: "Weather" };
}

export default function useWeather() {
  const [weather, setWeather] = useState({
    temperature: null,
    icon: "🌡️",
    label: "Loading",
    loading: true,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        const res = await fetch(WEATHER_API_URL);
        if (!res.ok) {
          throw new Error(`Weather request failed: ${res.status}`);
        }

        const data = await res.json();
        const current = data?.current;

        if (
          !current ||
          current.temperature_2m == null ||
          current.weather_code == null
        ) {
          throw new Error("Incomplete weather data");
        }

        const meta = getWeatherMeta(
          current.weather_code,
          current.temperature_2m,
        );

        if (isMounted) {
          setWeather({
            temperature: Math.round(current.temperature_2m),
            icon: meta.icon,
            label: meta.label,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setWeather((prev) => ({
            ...prev,
            loading: false,
            error: error.message || "Unable to load weather",
          }));
        }
      }
    };

    fetchWeather();

    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return weather;
}
