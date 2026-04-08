export default async () => {
  // Replace this mock data with your real schedule fetch logic
  const data = [
    {
      id: "1",
      title: "Reformer Strength",
      instructor: "Sana",
      start: "2026-04-08T08:00:00+01:00",
      end: "2026-04-08T08:50:00+01:00",
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
  ];

  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
    },
  });
};
