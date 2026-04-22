import { useState } from "react";
import studioPlt from "../assets/Studio-PLT-Logo-grey.svg";
import HGlogo from "../assets/hyperglow-logo.png.webp";
import { API_BASE } from "../utils/api";

const QUOTE_MAX_LENGTH = 100;
const WARNING_THRESHOLD = 25;

export default function QuoteFormPage() {
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const remainingChars = QUOTE_MAX_LENGTH - quote.length;
  const isNearLimit = remainingChars <= WARNING_THRESHOLD;
  const isAtLimit = remainingChars <= 0;

  const previewName = displayName.trim() || "Your Name";
  const previewQuote = quote.trim() || "Your message preview will appear here";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/submit-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          phoneNumber,
          quote,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit comment");
      }

      setMessage("Thank you! Your comment has been submitted.");
      setDisplayName("");
      setPhoneNumber("");
      setQuote("");
    } catch (error) {
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
          <h1 className="text-center text-2xl font-bold">Share a Message</h1>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
              required
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, ""))
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
              required
            />

            <div>
              <textarea
                placeholder="Write your message"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
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

            {/* Live Preview */}
            <div className="">
              <div className="mb-0.5 pl-1.5 text-sm font-bold">
                Live Preview :
              </div>

              <div className="rounded-lg bg-black/25 backdrop-blur-md">
                <div className="flex py-1.5 items-stretch">
                  <div className="flex flex-1 items-center justify-center overflow-hidden  text-center">
                    <div>
                      <div
                        className={`text-[14px] font-medium leading-relaxed ${
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

            <button
              type="submit"
              disabled={submitting || !quote.trim()}
              className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>

            {message && (
              <div className="text-center text-sm text-black/80">{message}</div>
            )}
          </div>
        </form>

        <div className="mt-6 w-full flex flex-col  items-center justify-start ">
          <h2 className="text-xs text-[#48525C] font-sans">Powered By</h2>
          <a href="https://hyperglow.co.uk/">
            <img src={HGlogo} alt="Hyperglow" className="w-40" />
          </a>
        </div>
      </div>
    </div>
  );
}
