// src/components/Footer.tsx
import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-700 to-blue-900 text-white relative mt-10">
      {/* Waves Background */}
      <div className="absolute top-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
  <defs>
    <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#2a4279ff" />
      <stop offset="100%" stopColor="#07278eff" />
    </linearGradient>
  </defs>
  <path
    fill="url(#waveGradient)"
    d="M0,160L60,149.3C120,139,240,117,360,133.3C480,149,600,203,720,202.7C840,203,960,149,1080,133.3C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
  />
</svg>
      </div>

      {/* Footer Content */}
      <div className="relative container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Left Info */}
        <div>
          <img
            src="/images/logobn.png"
            alt="gearX"
            className="w-40"
          />
          <p className="mb-4">
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt /> Địa chỉ: chung cư VP3 - bán đảo Linh Đàm - Q.Hoàng Mai
            </li>
            <li className="flex items-center gap-2">
              <FaPhone /> Điện thoại (Hotline): 0348.078.824
            </li>
            <li className="flex items-center gap-2">
              <FaGlobe /> Website: phutungxemayse.com
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> Email: ptxm.se@gmail.com
            </li>
          </ul>

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-3">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md w-fit">
              Chat Zalo
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md w-fit">
              Chat Facebook
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow-md w-fit">
              Hotline: 0999999999
            </button>
          </div>
        </div>

        {/* Center */}
        <div>
          <h3 className="font-bold mb-4">ĐIỀU KHOẢN</h3>
          <ul className="space-y-2">
            <li>Chính sách vận chuyển</li>
            <li>Chính sách đổi trả sản phẩm</li>
            <li>Chính sách bảo hành</li>
            <li>Bảng giá</li>
            <li>Chính sách vận chuyển</li>
            <li>Chính sách đổi trả sản phẩm</li>
            <li>Chính sách bảo hành</li>
            <li>Bảng giá</li>
          </ul>
        </div>

        {/* Right */}
        <div>
          <h3 className="font-bold mb-4">ĐIỀU KHOẢN</h3>
          <ul className="space-y-2 mb-4">
            <li>Chính sách vận chuyển</li>
            <li>Chính sách đổi trả sản phẩm</li>
            <li>Chính sách bảo hành</li>
            <li>Bảng giá</li>
          </ul>
          <div className="flex space-x-4">
            <a href="#" className="bg-white text-blue-600 p-2 rounded-full">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-white text-pink-600 p-2 rounded-full">
              <FaInstagram />
            </a>
            <a href="#" className="bg-white text-sky-500 p-2 rounded-full">
              <FaTwitter />
            </a>
            <a href="#" className="bg-white text-gray-600 p-2 rounded-full">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
