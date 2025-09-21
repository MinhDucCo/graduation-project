// Component Đối Tác
import React from "react";
const logos = [
  "/images/lg1.jpg",
  "/images/lg2.png",
  "/images/lg3.gif",
  "/images/lg4.jpg",
  "/images/lg51.jpg",
  "/images/lg6.png",
  "/images/lg7.webp",
  "/images/lg7.png",
  "/images/lg8.webp"
];

const Partners = () => {
  return (
    <section className="partners-section">
      <h2 className="partners-title">Đối tác & Khách hàng</h2>
      <div className="partners-slider">
        <div className="partners-track">
          {logos.map((logo, index) => (
            <div className="partner-logo" key={index}>
              <img src={logo} alt={`Logo ${index}`} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .partners-section {
          padding: 40px 0;
          text-align: center;
        }
        .partners-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        /* gạch chân dưới chữ */
        .partners-title::after {
          content: "";
          display: block;
          width: 95%;
          height: 2px;
          background: #797e82ff;
          margin: 8px auto 0;
          border-radius: 2px;
        }
        .partners-slider {
          overflow: hidden;
          position: relative;
          width: 100%;
          margin-top: 20px;
        }
        .partners-track {
          display: flex;
          align-items: center;
          animation: scroll 20s linear infinite;
        }
        .partner-logo {
          flex: 0 0 auto;
          width: 200px;
          height: 80px; /* cố định chiều cao */
          margin: 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .partner-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain; /* giữ tỉ lệ logo */
        }
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
};

export default Partners;
