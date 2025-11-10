"use client";
import { useEffect, useState } from "react";

export default function DonHangCuaToi() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    async function fetchOrders() {
      try {
        const res = await fetch(`http://localhost:3000/api/orders?id_user=${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  async function handleCancel(id: number, status: string) {
    if (!["Chờ xác nhận", "Đang xử lý"].includes(status)) {
      alert("Đơn hàng không thể hủy!");
      return;
    }

    if (!confirm("Bạn có chắc muốn hủy đơn này?")) return;

    await fetch(`http://localhost:3000/api/orders/cancel/${id}`, { method: "PUT" });
    setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: "Đã hủy" } : o));
  }

  if (loading) return <p className="text-center mt-10">Đang tải đơn hàng...</p>;

  if (orders.length === 0)
    return <p className="text-center mt-10 text-gray-500">Bạn chưa có đơn hàng nào.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Mã đơn: #{order.id}</p>
              <span
                className={`px-3 py-1 text-sm rounded-full
                ${
                  order.status === "Chờ xác nhận" ? "bg-yellow-200 text-yellow-700" :
                  order.status === "Đang giao" ? "bg-blue-200 text-blue-700" :
                  order.status === "Đã nhận" ? "bg-green-200 text-green-700" :
                  order.status === "Đã hủy" ? "bg-red-200 text-red-700" :
                  "bg-gray-200 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-3">Ngày đặt: {new Date(order.ngay_dat).toLocaleString()}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.location.href = `/don-hang/${order.id}`}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Xem chi tiết
              </button>

              {["Chờ xác nhận", "Đang xử lý"].includes(order.status) && (
                <button
                  onClick={() => handleCancel(order.id, order.status)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Hủy đơn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
