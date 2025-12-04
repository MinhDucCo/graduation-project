"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Lay user tu session backend
        const res = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          credentials: "include", // de gui cookie session
        });

        if (!res.ok) {
          console.error("Khong lay duoc user sau Google login");
          router.push("/Login");
          return;
        }

        const data = await res.json();
        if (!data.user) {
          router.push("/Login");
          return;
        }

        const user = data.user;

        // Luu localStorage giong login thuong
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("user-changed"));

        // Gop gio hang tam (sessionStorage.cart) vao gio user
        try {
          const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "[]");
          if (sessionCart.length > 0) {
            for (const item of sessionCart) {
              await fetch("http://localhost:3000/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...item,
                  id_user: user.id,
                }),
              });
            }
            sessionStorage.removeItem("cart");
          }
        } catch (err) {
          console.error("Loi gop gio hang sau Google login:", err);
        }

        // Lay trang cu de quay ve
        const redirectUrl =
          sessionStorage.getItem("redirectAfterLogin") || "/User";
        sessionStorage.removeItem("redirectAfterLogin");

        const vaiTro = Number(user.vai_tro);
        if (vaiTro === 1) {
          router.push("/Admin");
        } else {
          router.push(redirectUrl);
        }
      } catch (err) {
        console.error("Loi o LoginSuccess:", err);
        router.push("/Login");
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-semibold">Đang xử lý đăng nhập Google...</p>
    </div>
  );
}
