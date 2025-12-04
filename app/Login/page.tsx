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
        credentials: "include", // 🔥 BAT BUOC – GIU SESSION
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { message: text || "Phan hoi khong hop le tu server" };
      }

      if (!res.ok) {
        setMessage({ text: data.message || `Loi (${res.status})`, type: "error" });
        return;
      }

      if (!data.user) {
        setMessage({ text: "Du lieu nguoi dung khong hop le!", type: "error" });
        return;
      }

      // 🔹 Luu user
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-changed")); // thong bao thay doi user

      // 🔹 Gom gio hang tam (sessionStorage) -> api/cart/add
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
        console.error("⚠️ Loi khi gom gio hang:", mergeError);
      }

      //  Redirect ve trang truoc khi login 
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/User";
      sessionStorage.removeItem("redirectAfterLogin");

      const vaiTro = Number(data.user.vai_tro);
      if (vaiTro === 1) {
        router.push("/Admin");
      } else {
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error("[Login] fetch error:", err);
      setMessage({ text: "Loi he thong!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleLogin = () => {
  if (typeof window !== "undefined") {
    const current = sessionStorage.getItem("redirectAfterLogin");
    // neu chua co san thi moi set, neu da co thi giu nguyen
    if (!current) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname || "/User"
      );
    }
    window.location.href = "http://localhost:3000/api/auth/google";
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

          {/* css bao loi */}
          {message && (
            <p
              className={`mt-2 text-center text-bg font-bold ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
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

        {/* Nut dang nhap Google */}
        <div className="mt-4">
  <button
    type="button"
    onClick={handleGoogleLogin}
    className="w-full border border-gray-300 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
  >
    {/* Icon Google */}
    <svg
      className="w-5 h-5"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.25 13.02 17.62 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.57-.14-3.08-.41-4.55H24v9.11h12.7c-.55 2.82-2.23 5.21-4.75 6.82l7.68 5.98C43.93 37.85 46.5 31.74 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.58.27-3.11.76-4.54l-7.98-6.19A23.86 23.86 0 0 0 0 24c0 3.86.92 7.51 2.56 10.73l7.98-6.14z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.48 0 11.93-2.13 15.9-5.8l-7.68-5.98C30.26 36.89 27.4 37.9 24 37.9c-6.38 0-11.74-3.52-14.46-8.69l-7.98 6.14C6.51 42.62 14.62 47.5 24 47.5z"
      />
    </svg>

    <span>Đăng nhập với Google</span>
  </button>
</div>


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
