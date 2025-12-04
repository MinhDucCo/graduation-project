"use client";

import React, { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ten_nguoi_nhan: "",
    dia_chi: "",
    dien_thoai: "",
    ghi_chu: "",
  });

  const [phuongThucThanhToan, setPhuongThucThanhToan] =
    useState<"online" | "cod">("cod"); // mac dinh COD
  const [idUser, setIdUser] = useState<string | null>(null);

  // ham lay id_user dung chung (login -> user.id, chua login -> 10)
  const getCartUserId = () => {
    if (typeof window === "undefined") return 10;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.id) return user.id;
    return 10;
  };

  // ham xoa gio hang o khap noi: local/session + DB tung item
  const clearCartEverywhere = async () => {
    try {
      // xoa local va session storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        sessionStorage.removeItem("cart");
      }

      // xoa tren DB tung item theo route /api/cart/delete/:id
      for (const item of cart) {
        const rowId = item.id || item.id_san_pham;
        if (!rowId) continue;
        try {
          await fetch(
            `http://localhost:3000/api/cart/delete/${rowId}`,
            { method: "DELETE" }
          );
        } catch (err) {
          console.error("Loi xoa item cart:", err);
        }
      }

      // xoa state tren Checkout
      setCart([]);

      // neu ban con muon, co the broadcast event de AddToCart nghe
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-cleared"));
      }

      console.log("🗑️ Da clear gio hang ca client + DB");
    } catch (err) {
      console.error("Loi clearCartEverywhere:", err);
    }
  };

  // lay thong tin user de fill form + luu idUser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    setIdUser(user.id ?? null);

    fetch(`http://localhost:3000/api/users/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          ten_nguoi_nhan: data.ho_ten || "",
          dia_chi: data.dia_chi || "",
          dien_thoai: data.dien_thoai || "",
        }));
      })
      .catch((err) => console.error("Loi khi lay thong tin user:", err));
  }, []);

  // lay gio hang: uu tien DB, neu trong thi fallback local/session
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartUserId = getCartUserId();
        console.log("🟢 ID user hien tai:", cartUserId);

        const res = await fetch(
          `http://localhost:3000/api/cart?id_user=${cartUserId}`
        );
        const data = await res.json();
        console.log("🟢 Du lieu gio hang nhan duoc:", data);

        if (Array.isArray(data) && data.length > 0) {
          setCart(data);
        } else {
          // neu DB trong thi thu doc tu session/local
          if (typeof window !== "undefined") {
            const sessionCart = JSON.parse(
              sessionStorage.getItem("cart") || "[]"
            );
            const localCart = JSON.parse(
              localStorage.getItem("cart") || "[]"
            );
            const merged = sessionCart.length ? sessionCart : localCart;
            setCart(Array.isArray(merged) ? merged : []);
          } else {
            setCart([]);
          }
        }
      } catch (err) {
        console.error("Loi lay gio hang:", err);
        setCart([]);
      }
    };

    fetchCart();
  }, []);

  // submit don hang
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!cart.length) {
      alert("Gio hang cua ban dang trong!");
      return;
    }

    const orderData = {
      ...formData,
      id_user: idUser,
      items: cart.map((item) => ({
        id_san_pham: item.id_san_pham,
        so_luong: item.so_luong,
        gia: item.gia,
      })),
      phuong_thuc: phuongThucThanhToan,
    };

    try {
      const res = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Dat hang that bai!");
        return;
      }

      // xoa gio hang sau khi tao don hang thanh cong
      await clearCartEverywhere();

      console.log("Order gui len:", orderData);

      if (phuongThucThanhToan === "online") {
        const paymentRes = await fetch(
          "http://localhost:3000/api/vnpay/create_payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              don_hang_id: data.don_hang_id,
              tong_tien: data.tong_tien,
            }),
          }
        );

        const paymentData = await paymentRes.json();
        if (paymentData.success) {
          window.location.href = paymentData.paymentUrl;
        } else {
          alert("Loi: " + paymentData.error);
        }
      } else {
        alert(
          `Dat hang thanh cong! Ma don: ${data.don_hang_id}\nChung toi se giao hang va thu tien tai nha.`
        );
        window.location.href = "/don-hang-cua-toi";
      }
    } catch (err) {
      console.error("Loi khi dat hang:", err);
    }
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ben trai: Form dat hang */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          Thong tin dat hang
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Ten nguoi nhan"
              required
              className="border rounded px-3 py-2"
              value={formData.ten_nguoi_nhan}
              onChange={(e) =>
                setFormData({ ...formData, ten_nguoi_nhan: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Dia chi"
              required
              className="border rounded px-3 py-2"
              value={formData.dia_chi}
              onChange={(e) =>
                setFormData({ ...formData, dia_chi: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="So dien thoai"
              required
              className="border rounded px-3 py-2"
              value={formData.dien_thoai}
              onChange={(e) =>
                setFormData({ ...formData, dien_thoai: e.target.value })
              }
            />

            <textarea
              placeholder="Ghi chu"
              className="border rounded px-3 py-2"
              value={formData.ghi_chu}
              onChange={(e) =>
                setFormData({ ...formData, ghi_chu: e.target.value })
              }
            />
          </div>

          {/* phuong thuc thanh toan */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">
              Phuong thuc thanh toan:
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={phuongThucThanhToan === "cod"}
                  onChange={() => setPhuongThucThanhToan("cod")}
                  className="w-4 h-4 text-red-500"
                />
                <span className="flex items-center gap-2">
                  Giao hang & thu tien (COD)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={phuongThucThanhToan === "online"}
                  onChange={() => setPhuongThucThanhToan("online")}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="flex items-center gap-2">
                  Thanh toan online (VNPay)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition mt-4"
          >
            {phuongThucThanhToan === "online"
              ? "Tiep tuc thanh toan"
              : "Đặt Hàng Ngay"}
          </button>
        </form>
      </div>

      {/* Ben phai: Chi tiet don hang */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-blue-600 mb-5 text-center">
          🛒 Chi tiet don hang
        </h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500">
            Gio hang cua ban dang trong
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-3 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.hinh}
                    alt={item.ten_san_pham}
                    className="w-14 h-14 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.ten_san_pham}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mau: {item.mau_sac}
                    </p>
                    <p className="text-sm text-gray-500">
                      So luong:{" "}
                      <span className="font-semibold">{item.so_luong}</span>
                    </p>
                  </div>
                </div>

                <span className="text-blue-600 font-semibold">
                  {(item.so_luong * item.gia).toLocaleString()}đ
                </span>
              </li>
            ))}

            <li className="flex justify-between items-center pt-4 border-t font-bold text-lg">
              <span>Tong cong:</span>
              <span className="text-red-500">
                {cart
                  .reduce((sum, i) => sum + i.so_luong * i.gia, 0)
                  .toLocaleString()}
                đ
              </span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
