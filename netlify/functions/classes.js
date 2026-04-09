export default async () => {
  // Replace this mock data with your real schedule fetch logic
  const data = [
    {
      id: "1",
      title: "Reformer Strength",
      instructor: "Sana",
      start: "2026-04-07T08:00:00+01:00",
      end: "2026-04-07T08:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "2",
      title: "Origins",
      instructor: "Mia",
      start: "2026-04-08T10:00:00+01:00",
      end: "2026-04-08T10:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "3",
      title: "Origins",
      instructor: "Mia",
      start: "2026-04-08T08:00:00+01:00",
      end: "2026-04-08T08:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "4",
      title: "Origins",
      instructor: "Mia",
      start: "2026-04-08T07:00:00+01:00",
      end: "2026-04-08T07:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "5",
      title: "Studio PLT | Omakase | Intermediate to advanced (Mixed)",
      instructor: "Azhar Karatela",
      start: "2026-04-08T18:30:00+01:00",
      end: "2026-04-08T19:20:00+01:00",
      location: "Studio PLT | Oadby",
      status: "Scheduled",
    },
    {
      id: "6",
      title: "Reformer Condition (Men Only)",
      instructor: "Azhar Karatela",
      start: "2026-04-09T18:10:00+01:00",
      end: "2026-04-09T19:10:00+01:00",
      location: "Studio PLT | Oadby",
      status: "Scheduled",
    },
    {
      id: "7",
      title: "Studio PLT | Origins (Women only)",
      instructor: "Lucy Mills",
      start: "2026-04-09T18:10:00+01:00",
      end: "2026-04-09T19:10:00+01:00",
      location: "Studio PLT | Oadby",
      status: "Scheduled",
    },
    {
      id: "8",
      title: "Studio PLT | HIIT (Mixed)",
      instructor: "Lucy Mills",
      start: "2026-04-09T18:00:00+01:00",
      end: "2026-04-09T19:50:00+01:00",
      location: "Studio PLT | Oadby",
      status: "Scheduled",
    },
  ];

  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
    },
  });
};
