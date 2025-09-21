// components/ đối tác
import React from "react";

const logos = [
  "/images/partners/logo1.png",
  "/images/partners/logo2.png",
  "/images/partners/logo3.png",
  "/images/partners/logo4.png",
  "/images/partners/logo5.png",
  "/images/partners/logo6.png",
  "/images/partners/logo7.png",
];

const Partners = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-8 text-center">
          ĐỐI TÁC - KHÁCH HÀNG
        </h2>

        {/* Wrapper */}
        <div className="overflow-hidden relative">
          <div className="flex animate-scroll space-x-12">
            {logos.concat(logos).map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 h-24 flex items-center justify-center rounded-lg shadow-md bg-gray-100"
              >
                <img
                  src={logo}
                  alt={`Partner ${index}`}
                  className="max-h-20 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
