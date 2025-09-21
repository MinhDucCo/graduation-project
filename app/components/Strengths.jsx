import React from "react";
import { Settings, Award, DollarSign } from "lucide-react"; // npm install lucide-react

const strengths = [
  {
    icon: <Settings size={48} className="mx-auto text-white" />,
    title: "Hệ thống quản lý",
    desc: "Có hệ thống quản lý chất lượng ISO, năng lực sản xuất đáp ứng tiêu chuẩn tham gia chuỗi cung ứng của OEM và các Công ty đa quốc gia.",
  },
  {
    icon: <Award size={48} className="mx-auto text-white" />,
    title: "Đảm bảo chất lượng",
    desc: "Là công ty đúc trọng nhôm lực tại Miền Bắc có khả năng Kaizen, đảm nhận tốt các khâu từ Thiết kế, chế tạo khuôn.",
  },
  {
    icon: <DollarSign size={48} className="mx-auto text-white" />,
    title: "Giao hàng đúng tiến độ",
    desc: "Có năng lực sản xuất hàng loạt và phát triển các dự án New model với giá cả cạnh tranh, tiến độ nhanh.",
  },
];

const Strengths = () => {
  return (
    <section className="relative py-16 bg-[#1e73be] text-white overflow-hidden">
      {/* SVG pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-3xl font-bold mb-2">
          THẾ MẠNH CỦA CHÚNG TÔI
        </h2>
        <div className="w-24 h-1 bg-white mx-auto mb-12"></div>

        {/* Nội dung strengths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {strengths.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2x hover:scale-105 transform transition duration-300"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm opacity-90">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Strengths;
