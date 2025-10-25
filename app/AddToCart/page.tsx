"use client";
import { useEffect, useState } from "react";

export default function AddToCart() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    fetch("http://localhost:3000/api/cart")
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (cart.length === 0) return <h1>🛒 Giỏ hàng trống</h1>;

  const tongTien = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * (Number(item.so_luong) || 0),
    0
  );

  // Xóa sản phẩm
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/cart/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Chỉnh số lượng
  const handleQuantityChange = async (id: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(`http://localhost:3000/api/cart/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ so_luong: newQty }),
      });
      if (res.ok) fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">🛍️ Giỏ Hàng Của Bạn</h2>

      {/* Header bảng */}
      <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px_80px] gap-4 font-semibold border-b pb-2 mb-4">
        <div>Ảnh</div>
        <div>Tên sản phẩm</div>
        <div>Giá</div>
        <div>Số lượng</div>
        <div></div>
      </div>

      {/* Danh sách sản phẩm */}
      {cart.map((item: any) => (
        <div
          key={item.id}
          className="grid grid-cols-[80px_1fr_120px_120px_80px] items-center gap-4 p-3 border-b hover:bg-gray-50 transition-colors duration-200 rounded-lg md:rounded-none"
        >
          <img
            src={item.hinh}
            alt={item.ten_san_pham}
            className="w-21 h-21 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold">{item.ten_san_pham}</h3>
            <p className="text-gray-500 text-sm">Màu: {item.mau_sac}</p>
          </div>
          <div className="text-blue-600 font-bold">{Number(item.gia).toLocaleString()} ₫</div>
          <div className="flex items-center">
            <button
              className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300 transition-colors"
              onClick={() => handleQuantityChange(item.id, item.so_luong - 1)}
            >
              -
            </button>
            <span className="px-3">{item.so_luong}</span>
            <button
              className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300 transition-colors"
              onClick={() => handleQuantityChange(item.id, item.so_luong + 1)}
            >
              +
            </button>
          </div>
          <button
            className="text-red-600 hover:underline font-semibold transition-colors"
            onClick={() => handleDelete(item.id)}
          >
            Xóa
          </button>
        </div>
      ))}

      {/* Tổng tiền */}
      <div className="text-right mt-6 text-xl font-bold text-black-700">
        Tổng tiền: {tongTien.toLocaleString("vi-VN")} ₫
      </div>

      {/* Nút thanh toán */}
      <div className="text-right mt-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          onClick={() => alert("Chức năng thanh toán sắp ra mắt 😎")}
        >
          Thanh Toán
        </button>
      </div>
    </div>
  );
}
