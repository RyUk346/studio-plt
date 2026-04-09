import { useEffect, useRef, useState } from "react";

const videos = ["/bg.mp4", "/bg_1.mp4", "/bg_2.mp4"];

export default function BackgroundVideo() {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % videos.length);
      }, 300);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const handleCanPlay = async () => {
      try {
        await video.play();
        setVisible(true);
      } catch (err) {
        console.error("Video play failed:", err);
      }
    };

    video.addEventListener("canplay", handleCanPlay, { once: true });

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [index]);

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={videos[index]} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
