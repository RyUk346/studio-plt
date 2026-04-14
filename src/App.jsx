import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuoteFormPage from "./pages/QuoteFormPage";
import ScheduleBoard from "./component/ScheduleBoard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/StudioPLT/PLT-OP-LP/Layer1" element={<ScheduleBoard />} />
        <Route
          path="/StudioPLT/PLT-OP-LP/Message"
          element={<QuoteFormPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
