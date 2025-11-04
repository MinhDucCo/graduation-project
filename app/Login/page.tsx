'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, mat_khau: matKhau }),
    });

    console.log("[Login] response status:", res.status, res.statusText);

    let data: any;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      data = { message: text || "Phản hồi không hợp lệ từ server" };
    }

    console.log("[Login] response body:", data);

    if (!res.ok) {
      alert(`❌ ${data.message || `Lỗi (${res.status})`}`);
      return;
    }

    // 🔹 Kiểm tra dữ liệu user có tồn tại
    if (!data.user) {
      alert("❌ Dữ liệu người dùng không hợp lệ hoặc thiếu trong phản hồi!");
      return;
    }

    // 🔹 Lưu thông tin user vào localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // ✅ Gộp giỏ hàng tạm vào DB
    try {
      const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "[]");

      if (sessionCart.length > 0) {
        console.log("🛒 Gộp giỏ hàng session vào DB:", sessionCart);
        for (const item of sessionCart) {
          await fetch("http://localhost:3000/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...item,
              id_user: data.user.id, // gán id_user thực
            }),
          });
        }

        // ✅ Xóa giỏ hàng tạm sau khi gộp
        sessionStorage.removeItem("cart");
        console.log("✅ Giỏ hàng session đã được gộp và xóa");
      }
    } catch (mergeError) {
      console.error("⚠️ Lỗi khi gộp giỏ hàng:", mergeError);
    }

    // 🔹 Kiểm tra vai trò: 1 = admin, còn lại là user
    const vaiTro = Number(data.user.vai_tro);
    if (vaiTro === 1) {
      router.push("/Admin");
    } else {
      router.push("/User");
    }
  } catch (err) {
    console.error("[Login] fetch error:", err);
    alert("❌ Lỗi hệ thống! Không thể kết nối đến máy chủ.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700 tracking-wide">
          Đăng nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 hover:shadow-lg transition duration-200 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Liên kết phụ */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <span
              className="text-blue-600 hover:underline font-medium cursor-pointer"
              onClick={() => router.push("/Register")}
            >
              Đăng ký ngay
            </span>
          </p>

          <p>
            <span
              className="text-blue-600 hover:underline text-sm font-medium cursor-pointer"
              onClick={() => router.push("/forgot-password")}
            >
              Quên mật khẩu?
            </span>
          </p>
        </div>
      </div>
    </div>
  );

}
