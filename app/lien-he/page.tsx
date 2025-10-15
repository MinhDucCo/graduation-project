"use client";
import React, { useState } from "react";

export default function LienHePage() {
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    noi_dung: "",
  });
  const [message, setMessage] = useState("");

  // Hàm xử lý khi người dùng nhập
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Hàm gửi dữ liệu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/lien-he/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Gửi liên hệ thành công!");
        setFormData({ ho_ten: "", email: "", so_dien_thoai: "", noi_dung: "" });
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi gửi liên hệ!");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Cột thông tin */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Thông tin liên hệ</h2>
          <ul className="space-y-3 text-gray-700">
            <li><strong>📍 Địa chỉ:</strong> 123 Nguyễn Văn Linh, Q.7, TP.HCM</li>
            <li><strong>📞 Hotline:</strong> 1900 123 456</li>
            <li><strong>✉️ Email:</strong> gearX@gmail.com</li>
            <li><strong>⏰ Giờ làm việc:</strong> 8h00 - 18h00 (Thứ 2 - CN)</li>
          </ul>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="ho_ten" className="block text-gray-700 font-medium mb-1">Họ và tên</label>
              <input
                id="ho_ten"
                type="text"
                value={formData.ho_ten}
                onChange={handleChange}
                placeholder="Nhập họ tên của bạn"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="so_dien_thoai" className="block text-gray-700 font-medium mb-1">Số điện thoại</label>
              <input
                id="so_dien_thoai"
                type="text"
                value={formData.so_dien_thoai}
                onChange={handleChange}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="noi_dung" className="block text-gray-700 font-medium mb-1">Nội dung</label>
              <textarea
                id="noi_dung"
                rows={5}
                value={formData.noi_dung}
                onChange={handleChange}
                placeholder="Nhập nội dung liên hệ..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
              Gửi liên hệ
            </button>
          </form>

          {message && <p className="mt-4 text-center text-s text-green-500">{message}</p>}
        </div>
      </main>
    </div>
  );
}
