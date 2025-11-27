"use client"
import { useState, useEffect } from "react";
const images = [
  "/images/banner-phukien.png", // đổi thành ảnh của bạn trong public/images
  "/images/b5.jpg",
  "/images/b3.webp",
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tự động chuyển ảnh sau 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Slide images */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            className="w-full h-[500px] object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Dots indicator */}
      {/* <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div> */}

      {/* Prev & Next button */}
      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          )
        }
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev + 1) % images.length)
        }
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        ›
      </button>
    </div>
  );
}
