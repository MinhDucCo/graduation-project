"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null); // reset message

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, mat_khau: matKhau }),
  credentials: "include", // 🔥 BẮT BUỘC – GIỮ SESSION
});


      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { message: text || "Phản hồi không hợp lệ từ server" };
      }

      if (!res.ok) {
        setMessage({ text: data.message || `Lỗi (${res.status})`, type: "error" });
        return;
      }

      if (!data.user) {
        setMessage({ text: "Dữ liệu người dùng không hợp lệ!", type: "error" });
        return;
      }

      // 🔹 Lưu user
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-changed"));// thông báo thay đổi user
      // 🔹 Gộp giỏ hàng tạm
      try {
        const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "[]");

        if (sessionCart.length > 0) {
          for (const item of sessionCart) {
            await fetch("http://localhost:3000/api/cart/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...item,
                id_user: data.user.id,
              }),
            });
          }

          sessionStorage.removeItem("cart");
        }
      } catch (mergeError) {
        console.error("⚠️ Lỗi khi gộp giỏ hàng:", mergeError);
      }

      //  Redirect về trang trước khi login 
      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "/User";

      sessionStorage.removeItem("redirectAfterLogin");

      const vaiTro = Number(data.user.vai_tro);
      if (vaiTro === 1) {
        router.push("/Admin");
      } else {
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error("[Login] fetch error:", err);
      setMessage({ text: "Lỗi hệ thống!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Đăng nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
             {/* css báo lỗi*/}
          {message && (
            <p
              className={`mt-2 text-red-600 text-center text-bg ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              } font-bold`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

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
