import { useState } from "react";
import studioPlt from "../../public/Studio-PLT-Logo-grey.svg";
import HGlogo from "../../public/hyperglow-logo.png.webp";

const QUOTE_MAX_LENGTH = 200;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/.netlify/functions/submit-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          phoneNumber,
          quote,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit quote");
      }

      setMessage("Thank you! Your quote has been submitted.");
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
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-200 px-4 text-black">
      <div className="flex justify-between items-center gap-4 mb-4">
        <img src={studioPlt} alt="" className="w-15 " />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl border border-black/10 bg-gray-300 p-4"
      >
        <h1 className="text-2xl font-bold text-center">Submit Your Comment</h1>

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
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none"
            required
          />

          <div>
            <textarea
              placeholder="Write your quote"
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
      <div className="flex gap-2 justify-center items-center mt-4">
        <h2>Powered By,</h2>
        <a href="https://hyperglow.co.uk/">
          <img src={HGlogo} alt="" className="w-40" />
        </a>
      </div>
    </div>
  );
}
