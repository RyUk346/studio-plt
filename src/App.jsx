import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuoteFormPage from "./pages/QuoteFormPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
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
        <Route path="/StudioPLT/PLT-OP-LP/Login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
