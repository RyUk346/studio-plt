// import BackgroundVideo from "./component/BackgroundVideo";
import ScheduleBoard from "./component/ScheduleBoard";

export default function App() {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      {/* <BackgroundVideo /> */}

      <div className="relative z-10 min-h-screen">
        <ScheduleBoard />
      </div>
    </div>
  );
}
