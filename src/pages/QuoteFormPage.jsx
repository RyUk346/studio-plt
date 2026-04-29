import { useState } from "react";
import studioPlt from "../assets/Studio-PLT-Logo-grey.svg";
import HGlogo from "../assets/hyperglow-logo.png.webp";
import { API_BASE } from "../utils/api";
import { isMessageSafe } from "../utils/messageFilter";

const QUOTE_MAX_LENGTH = 100;
const WARNING_THRESHOLD = 25;
const NAME_MAX_LENGTH = 12;

export default function QuoteFormPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(""); // ✅ changed
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const remainingChars = QUOTE_MAX_LENGTH - quote.length;
  const isNearLimit = remainingChars <= WARNING_THRESHOLD;
  const isAtLimit = remainingChars <= 0;

  const previewName = displayName.trim() || "Your Name";
  const previewQuote =
    quote.trim() || "Your message preview will appear here";

  // ✅ email validation
  const isValidEmail = (value = "") =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = displayName.trim();
    const cleanEmail = email.trim(); // ✅ changed
    const cleanQuote = quote.trim();

    // ✅ moderation check
    if (!isMessageSafe(cleanName) || !isMessageSafe(cleanQuote)) {
      setIsError(true);
      setMessage("Please avoid inappropriate language.");
      return;
    }

    // ✅ required validation
    if (!cleanName || !cleanEmail || !cleanQuote) {
      setIsError(true);
      setMessage("Name, email, and message are required.");
      return;
    }

    // ✅ email format validation
    if (!isValidEmail(cleanEmail)) {
      setIsError(true);
      setMessage("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setMessage("Your message will appear shortly if approved.");
    setIsError(false);

    try {
      const res = await fetch(`${API_BASE}/api/submit-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: cleanName,
          email: cleanEmail, // ✅ changed
          quote: cleanQuote,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setIsError(true);
        setMessage(data?.error || "This message is against our policy.");
        setSubmitting(false);
        return;
      }

      setIsError(false);
      setMessage("Thank you! Your message has been submitted.");

      // ✅ reset
      setDisplayName("");
      setEmail("");
      setQuote("");
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 px-4 py-2 text-black">
      <div className="mb-4 flex items-center justify-between gap-4">
        <img src={studioPlt} alt="Studio PLT" className="w-15" />
      </div>

      <div className="w-full max-w-xl space-y-2">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl border border-black/10 bg-gray-300 p-4"
        >
          <h1 className="text-center text-2xl font-bold">
            Share a Message
          </h1>

          <div className="mt-6 space-y-4">
            {/* NAME */}
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setMessage("");
                setIsError(false);
              }}
              maxLength={NAME_MAX_LENGTH}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
              required
            />

            {/* EMAIL (REPLACED PHONE) */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
                setIsError(false);
              }}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
              required
            />

            {/* MESSAGE */}
            <div>
              <textarea
                placeholder="Write your message"
                value={quote}
                onChange={(e) => {
                  setQuote(e.target.value);
                  setMessage("");
                  setIsError(false);
                }}
                maxLength={QUOTE_MAX_LENGTH}
                className="h-32 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
                required
              />

              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-black/50">
                  Maximum {QUOTE_MAX_LENGTH} characters
                </div>

                <div
                  className={`text-sm font-medium ${
                    isAtLimit
                      ? "text-red-500"
                      : isNearLimit
                      ? "text-yellow-500"
                      : "text-black/60"
                  }`}
                >
                  {quote.length}/{QUOTE_MAX_LENGTH}
                </div>
              </div>
            </div>

            {/* PREVIEW */}
            <div>
              <div className="mb-0.5 pl-1.5 text-sm font-bold">
                Live Preview :
              </div>

              <div className="rounded-lg bg-black/25 backdrop-blur-md">
                <div className="flex items-stretch py-1.5">
                  <div className="flex flex-1 items-center justify-center text-center">
                    <div>
                      <div
                        className={`text-[14px] font-medium ${
                          quote.trim() ? "text-white" : "text-white/50"
                        }`}
                      >
                        “{previewQuote}”
                      </div>
                      <div className="text-[10px] text-white/60">
                        — {previewName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting || !quote.trim()}
              className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>

            {/* MESSAGE */}
            {message && (
              <div
                className={`rounded-lg px-3 py-2 text-center text-sm font-medium ${
                  isError
                    ? "border border-red-500/30 bg-red-500/10 text-red-600"
                    : "border border-green-500/30 bg-green-500/10 text-green-700"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 flex w-full flex-col items-center">
          <h2 className="text-xs text-[#48525C]">Powered By</h2>
          <a href="https://hyperglow.co.uk/">
            <img src={HGlogo} alt="Hyperglow" className="w-40" />
          </a>
        </div>
      </div>
    </div>
  );
}