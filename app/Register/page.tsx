"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    mat_khau: "",
    ho_ten: "",
     nhap_lai_mat_khau: "",
    dien_thoai: "", // thêm trường số điện thoại
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePhone = (phone: string) => {
    // đơn giản: chỉ cho phép chữ số, dấu +, tối đa 15 ký tự
    const re = /^\+?\d{7,15}$/;
    return re.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // kiểm tra số điện thoại nếu có nhập
    if (formData.dien_thoai && !validatePhone(formData.dien_thoai)) {
      setMessage("Số điện thoại không hợp lệ. Vui lòng nhập chỉ chữ số (7-15 ký tự), có thể có dấu + ở đầu.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message || "Đăng ký không thành công!");
    } catch (error) {
      console.error(error);
      setMessage("Lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-300 px-4">
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.02]"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-700 tracking-wide">
        Đăng ký tài khoản
      </h2>

      {/* Họ tên */}
      <div className="mb-5">
        <label htmlFor="ho_ten" className="block text-sm font-semibold text-gray-700 mb-1">
          Họ tên
        </label>
        <input
          type="text"
          name="ho_ten"
          id="ho_ten"
          required
          value={formData.ho_ten}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Nhập họ tên của bạn"
        />
      </div>

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Nhập email"
        />
      </div>

      {/* Số điện thoại */}
      <div className="mb-5">
        <label htmlFor="dien_thoai" className="block text-sm font-semibold text-gray-700 mb-1">
          Số điện thoại (tùy chọn)
        </label>
        <input
          type="tel"
          name="dien_thoai"
          id="dien_thoai"
          value={formData.dien_thoai}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Nhập số điện thoại (+84)"
          maxLength={15}
        />
      </div>

      {/* Mật khẩu */}
      <div className="mb-5">
        <label htmlFor="mat_khau" className="block text-sm font-semibold text-gray-700 mb-1">
          Mật khẩu
        </label>
        <input
          type="password"
          name="mat_khau"
          id="mat_khau"
          required
          value={formData.mat_khau}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Nhập mật khẩu"
        />
      </div>

      {/* Nhập lại mật khẩu */}
      <div className="mb-8">
        <label htmlFor="nhap_lai_mat_khau" className="block text-sm font-semibold text-gray-700 mb-1">
          Nhập lại mật khẩu
        </label>
        <input
          type="password"
          name="nhap_lai_mat_khau"
          id="nhap_lai_mat_khau"
          required
          value={formData.nhap_lai_mat_khau}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      {/* Nút đăng ký */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 hover:shadow-lg transition duration-200 disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>

      {/* Thông báo */}
      {message && (
        <p
          className={`mt-5 text-center font-medium ${
            message.includes("thành công") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  </div>
);


}
