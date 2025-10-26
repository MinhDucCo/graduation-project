"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-200">
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
    >
      {/* Tiêu đề */}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700 tracking-wide">
        Quên mật khẩu
      </h2>

      {/* Email */}
      <input
        type="email"
        placeholder="Nhập email của bạn"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
        required
      />

      {/* Gửi mã */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 ease-in-out"
      >
        {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
      </button>

      {/* Thông báo */}
      {message && (
        <p className="mt-4 text-center text-gray-600 text-sm">{message}</p>
      )}

      {/* Chuyển trang */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-3">Đã có mã xác nhận?</p>
        <button
          type="button"
          onClick={() => router.push("/reset-password")}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          Nhập mã OTP & đổi mật khẩu
        </button>
      </div>
    </form>
  </div>
);


}
