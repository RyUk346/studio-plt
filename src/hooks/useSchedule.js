import { useEffect, useState } from "react";

export default function useSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await fetch("/.netlify/functions/sheets?type=routine");
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
    const interval = setInterval(fetchRoutine, 30000);

    return () => clearInterval(interval);
  }, []);

  return { classes, loading };
}
