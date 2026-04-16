import { useEffect, useState } from "react";
import QRCodeModule from "react-qr-code";

const QRCodeComponent =
  QRCodeModule?.default || QRCodeModule?.QRCode || QRCodeModule;

export default function QuotesSection({ quotes = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!Array.isArray(quotes) || quotes.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes]);
  const [qrSize, setQrSize] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      // If screen is smaller than 1750px (matching your layout), make QR smaller
      if (window.innerWidth < 1750) {
        setQrSize(60);
      } else {
        setQrSize(100);
      }
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentQuote =
    Array.isArray(quotes) && quotes.length > 0
      ? quotes[index % quotes.length]
      : null;

  const submitUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/StudioPLT/PLT-OP-LP/Message`
      : "/StudioPLT/PLT-OP-LP/Message";

  return (
    <div className="h-full w-full rounded-3xl border border-white/10 bg-black/25 p-2 backdrop-blur-md">
      {" "}
      <div className="flex h-full items-stretch gap-4">
        {/* <div className="flex h-full min-w-[220px] flex-col items-start justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <div className="text-sm uppercase tracking-[0.2em] text-white/50">
            Studio PLT
          </div>
          <div className="mt-2 text-xl font-bold leading-tight">Comments</div>
        </div> */}

        <div className="flex h-full flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center">
          {currentQuote ? (
            <div className="">
              <div className="max-[1750px]:text-lg text-2xl font-medium leading-relaxed text-white">
                “{currentQuote.quote}”
              </div>
              <div className="mt-3 max-[1750px]:text-sm text-md text-white/60">
                — {currentQuote.displayName || "Anonymous"}
              </div>
            </div>
          ) : (
            <div className="max-[1750px]:text-lg text-2xl font-medium text-white/70">
              Scan QR code to share a message
            </div>
          )}
        </div>

        <div className="flex h-full flex-col items-center justify-center rounded-2xl text-center">
          <div className="flex items-center justify-center bg-white rounded-xl">
            <QRCodeComponent value={submitUrl} size={qrSize} />
          </div>
        </div>
      </div>
    </div>
  );
}
