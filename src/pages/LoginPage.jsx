import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import studioPlt from "../assets/Studio-PLT-Logo-grey.svg";
import { login } from "../utils/auth";

const MAIN_PASSWORD = "123456"; // change this

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/StudioPLT/PLT-OP-LP/Layer1";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password === MAIN_PASSWORD) {
      login();
      navigate(from, { replace: true });
      return;
    }

    setError("Incorrect password");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex justify-center">
          <img src={studioPlt} alt="Studio PLT" className="w-20" />
        </div>

        <h1 className="text-center text-3xl font-bold">Main Screen Login</h1>
        <p className="mt-2 text-center text-white/60">
          Enter password to access the main screen
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
            required
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:scale-[1.01]"
          >
            Login
          </button>

          {error ? (
            <div className="text-center text-sm text-red-400">{error}</div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
