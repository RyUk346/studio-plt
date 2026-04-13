import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuoteFormPage from "./pages/QuoteFormPage";
import ScheduleBoard from "./component/ScheduleBoard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScheduleBoard />} />
        <Route path="/quote" element={<QuoteFormPage />} />
      </Routes>
    </BrowserRouter>
  );
}
