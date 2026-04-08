import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// Replace this with real fetch logic from your booking source
app.get("/api/classes", async (req, res) => {
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
      id: "8",
      title: "Condition",
      instructor: "Ali",
      start: "2026-04-09T18:00:00+01:00",
      end: "2026-04-09T18:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "9",
      title: "Condition",
      instructor: "Ali",
      start: "2026-04-09T18:00:00+01:00",
      end: "2026-04-09T18:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "5",
      title: "Condition",
      instructor: "Ali",
      start: "2026-04-10T18:00:00+01:00",
      end: "2026-04-10T18:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
    {
      id: "6",
      title: "Condition",
      instructor: "Ali",
      start: "2026-04-11T18:00:00+01:00",
      end: "2026-04-11T18:50:00+01:00",
      location: "Oadby",
      status: "Scheduled",
    },
  ];

  res.json(data);
});

app.listen(3001, () => {
  console.log("API server running on http://localhost:3001");
});
