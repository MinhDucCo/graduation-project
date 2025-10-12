"use client";
import { useEffect, useState } from "react";
import { ICart } from "@/app/components/cautrucdata";

export default function AddToCart() {
  const [cart, setCart] = useState<ICart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/cart")
      .then(res => res.json())
      .then(data => {
        console.log("🛍️ Dữ liệu giỏ hàng:", data);
        setCart(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (cart.length === 0) return <p>🛒 Giỏ hàng trống</p>;

  const tongTien = cart.reduce((sum, item) => sum + item.gia * item.so_luong, 0);

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">🛍️ Giỏ Hàng Của Bạn</h2>

      {cart.map((item: any) => (
  <div key={item.id} className="flex items-center justify-between p-4 border-b">
    <img src={item.hinh} alt={item.ten_san_pham} className="w-24 h-24 object-cover rounded-lg" />
    <div className="flex-1 ml-4">
      <h3 className="font-semibold">{item.ten_san_pham}</h3>
      <p className="text-gray-500">Màu sắc: {item.mau_sac}</p>
      <p className="text-blue-600 font-bold">{item.gia.toLocaleString('vi-VN')} ₫</p>
      <p>Số lượng: {item.so_luong}</p>
    </div>
  </div>
))}


      <div className="text-right mt-6 text-xl font-bold text-green-700">
        Tổng tiền: {tongTien.toLocaleString("vi-VN")} ₫
      </div>
    </div>
  );
}
