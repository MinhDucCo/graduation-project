"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
      >
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700 tracking-wide">
          Đặt lại mật khẩu
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          required
        />

        {/* Mã OTP */}
        <input
          type="text"
          placeholder="Nhập mã xác nhận (OTP)"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          required
        />

        {/* Mật khẩu mới */}
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          required
        />

        {/* Nút đổi mật khẩu */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 ease-in-out"

        >
          {loading ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>

        {/* Thông báo */}
        {message && (
          <p className="mt-5 text-center text-gray-600 text-sm">{message}</p>
        )}
      </form>
    </div>
  );

}
