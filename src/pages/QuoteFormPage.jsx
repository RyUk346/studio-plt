import { useState } from "react";

export default function QuoteFormPage() {
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold">Submit Your Quote</h1>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            required
          />

          <textarea
            placeholder="Write your quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="h-32 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {message && (
            <div className="text-center text-sm text-white/80">{message}</div>
          )}
        </div>
      </form>
    </div>
  );
}
