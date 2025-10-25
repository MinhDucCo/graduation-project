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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Quên mật khẩu
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring focus:ring-blue-300"
          required
        />

        {/* Gửi mã */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
        </button>

        {/* Thông báo */}
        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}

        {/* Nút sang trang nhập OTP + mật khẩu mới */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-2">Đã có mã xác nhận?</p>
          <button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Nhập mã OTP & đổi mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
}
