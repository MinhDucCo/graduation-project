// Component Giới Thiệu Công Ty

import React from "react";
import { Briefcase } from "lucide-react"; // icon (cần cài: npm install lucide-react)
const AboutCompany = () => {
    return (
        <section className="bg-white py-16 relative">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                {/* Hình ảnh */}
                <div className="relative">
                    <img
                        src="/images/xedo.jpg"
                        alt="Công ty phụ tùng xe máy"
                        className="rounded-xl shadow-lg w-2/4 mx-auto"
                    />
                    <img
                        src="/images/about1.jpg" // ảnh phụ
                        alt="Đội ngũ"
                        className="absolute bottom-[-30px] right-[-30px] w-1/2 rounded-xl shadow-md border-4 border-white"
                    />

                    {/* Box kinh nghiệm */}
                    <div className="absolute top-5 left-5 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg">
                        <Briefcase size={28} />
                        <div>
                            <p className="text-2xl font-bold">30+</p>
                            <p className="text-sm">Kinh nghiệm</p>
                        </div>
                    </div>
                </div>

                {/* Nội dung */}
                <div>
                    <h3 className="text-orange-600 font-semibold uppercase">
                        Về chúng tôi
                    </h3>
                    <h2 className="text-3xl md:text-1xl font-bold text-gray-900 mb-6">
                        Công ty phụ tùng xe máy DEMO Việt Nam
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Công ty DEMO chuyên cung cấp và phân phối các loại phụ tùng xe máy
                        chính hãng với hệ thống quản lý chất lượng theo tiêu chuẩn ISO 9001
                        &amp; 14001. Đội ngũ kỹ thuật có kinh nghiệm nhiều năm trong ngành
                        giúp chúng tôi tự tin đáp ứng mọi yêu cầu khắt khe về chất lượng,
                        tiến độ và giá cả cạnh tranh.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Chúng tôi cam kết mang đến những sản phẩm phụ tùng xe máy tốt nhất,
                        đảm bảo an toàn và bền bỉ, đồng hành cùng khách hàng trên mọi chặng
                        đường.
                    </p>
                    <button className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-700 transition">
                        Xem chi tiết →
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AboutCompany;
