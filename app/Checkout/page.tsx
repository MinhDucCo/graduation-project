"use client";
import { useEffect, useState } from "react";


export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ho_ten: "",
    dia_chi: "",
    dien_thoai: "",
    ghi_chu: "",
  });

  const [idUser, setIdUser] = useState<string | null>(null);

  // 🔹 Lấy id_user sau khi client render
  useEffect(() => {
    const userId = localStorage.getItem("id_user");
    setIdUser(userId);
  }, []);

  // 🔹 Lấy giỏ hàng từ backend khi có idUser
  useEffect(() => {
  async function fetchCart() {
    console.log("🟢 ID user hiện tại:", idUser);
    if (!idUser) return;
    try {
      const res = await fetch(`http://localhost:3000/api/cart?id_user=${idUser}`);
      const data = await res.json();
      console.log("🟢 Dữ liệu giỏ hàng nhận được:", data);
      setCart(data);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
    }
  }
  fetchCart();
}, [idUser]);

  // 🔹 Submit đơn hàng
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) {
      alert("Giỏ hàng của bạn đang trống!");
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
    };

    try {
      const res = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Đặt hàng thành công!");
        setCart([]);
      } else {
        alert(data.error || "Đặt hàng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
    }
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bên trái: Form đặt hàng */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          Thông tin đặt hàng
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Họ tên"
            className="border rounded px-3 py-2"
            value={formData.ho_ten}
            onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
          />
          <input type="text" placeholder="Địa chỉ"
            className="border rounded px-3 py-2"
            value={formData.dia_chi}
            onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
          />
          <input type="text" placeholder="Số điện thoại"
            className="border rounded px-3 py-2"
            value={formData.dien_thoai}
            onChange={(e) => setFormData({ ...formData, dien_thoai: e.target.value })}
          />
          <textarea placeholder="Ghi chú"
            className="border rounded px-3 py-2"
            value={formData.ghi_chu}
            onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
          />
          <button type="submit"
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Đặt hàng ngay
          </button>
        </form>
      </div>

      {/* Bên phải: Chi tiết đơn hàng */}
     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
  <h2 className="text-2xl font-semibold text-blue-600 mb-5 text-center">
    🛒 Chi tiết đơn hàng
  </h2>

  {cart.length === 0 ? (
    <p className="text-center text-gray-500">Giỏ hàng của bạn đang trống 😥</p>
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
              <p className="font-medium text-gray-800">{item.ten_san_pham}</p>
              <p className="text-sm text-gray-500">Màu: {item.mau_sac}</p>
              <p className="text-sm text-gray-500">
                Số lượng: <span className="font-semibold">{item.so_luong}</span>
              </p>
            </div>
          </div>

          <span className="text-blue-600 font-semibold">
            {(item.so_luong * item.gia).toLocaleString()}đ
          </span>
        </li>
      ))}

      <li className="flex justify-between items-center pt-4 border-t font-bold text-lg">
        <span>Tổng cộng:</span>
        <span className="text-red-500">
          {cart
            .reduce((sum, i) => sum + i.so_luong * i.gia, 0)
            .toLocaleString()}đ
        </span>
      </li>
    </ul>
  )}
</div>

    </div>
  );
}
