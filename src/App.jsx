import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuoteFormPage from "./pages/QuoteFormPage";
import ScheduleBoard from "./component/ScheduleBoard";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./component/ProtectedRoute";

const MAIN_PATH = "/StudioPLT/PLT-OP-LP/Layer1";
const MESSAGE_PATH = "/StudioPLT/PLT-OP-LP/Message";
const LOGIN_PATH = "/StudioPLT/PLT-OP-LP/Login";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={MAIN_PATH}
          element={
            // <ProtectedRoute>
            <ScheduleBoard />
            /* </ProtectedRoute> */
          }
        />

        <Route path={MESSAGE_PATH} element={<QuoteFormPage />} />
        {/* <Route path={LOGIN_PATH} element={<LoginPage />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
