import ClassCard from "./ClassCard";
import { formatDayLabel } from "../utils/date";

export default function DaySection({ date, items }) {
  return (
    <section className="space-y-4">
      <div className="sticky top-0 z-10 rounded-xl bg-black/40 px-4 py-3 backdrop-blur">
        <h2 className="text-2xl font-bold tracking-wide text-yellow-300">
          {formatDayLabel(date)}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ClassCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
