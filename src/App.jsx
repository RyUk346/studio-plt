import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuoteFormPage from "./pages/QuoteFormPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ScheduleBoard from "./component/ScheduleBoard";

export default function App() {
  return (
    <BrowserRouter basename="/studio-plt">
      <Routes>
        <Route path="/Layer1" element={<ScheduleBoard />} />
        <Route path="/Message" element={<QuoteFormPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
