"use client";

import { useEffect, useState } from "react";

export default function DonHangCuaToi() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State modal
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handleOpenModal = (id: number) => {
    setSelectedOrderId(id);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/orders?id_user=${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Thay đổi handleCancelOrder để nhận id từ selectedOrderId
  const handleCancelOrder = async () => {
    if (selectedOrderId === null) return;

    try {
      const res = await fetch(`http://localhost:3000/api/orders/cancel/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ly_do_huy: "Đã hủy" }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(prev =>
          prev.map(o => o.id === selectedOrderId ? { ...o, status: "canceled", ly_do_huy: "Đã hủy" } : o)
        );
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi hủy đơn:", err);
    } finally {
      setShowModal(false);
      setSelectedOrderId(null);
    }
  };




  if (loading) return <p className="text-center mt-10">Đang tải đơn hàng...</p>;

  if (!orders.length)
    return <p className="text-center mt-10 text-gray-500">Bạn chưa có đơn hàng nào.</p>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Đơn hàng của tôi</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Mã đơn hàng: #{order.id}</h2>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-medium ${order.status === "success"
                  ? "bg-green-600"
                  : order.status === "pending"
                    ? "bg-yellow-500"
                    : order.status === "canceled"
                      ? "bg-gray-400"
                      : "bg-red-600"
                  }`}
              >
                {order.status}
              </span>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 mb-4">
              <p><strong>Ngày đặt:</strong> {new Date(order.ngay_dat).toLocaleString()}</p>
              <p><strong>Người nhận:</strong> {order.ten_nguoi_nhan}</p>
              <p><strong>Địa chỉ:</strong> {order.dia_chi}</p>
              <p><strong>Điện thoại:</strong> {order.dien_thoai}</p>
              <p><strong>Phương thức thanh toán:</strong> {order.phuong_thuc}</p>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="mt-4 border-t pt-3">
              <h3 className="font-semibold mb-3 text-gray-700">Chi tiết sản phẩm</h3>
              {order.chi_tiet?.map((ct: any) => (
                <div
                  key={ct.id_chi_tiet}
                  className="flex justify-between border-b py-2 last:border-b-0"
                >
                  <div className="text-gray-600">
                    <p><strong>ID sản phẩm:</strong> {ct.id_san_pham}</p>
                    <p><strong>Số lượng:</strong> {ct.so_luong}</p>
                  </div>
                  <p className="font-semibold text-gray-800">{ct.gia.toLocaleString()}₫</p>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="text-right mt-4 font-bold text-lg text-gray-800">
              Tổng tiền:{" "}
              {order.chi_tiet
                ?.reduce((total: number, item: any) => total + item.gia * item.so_luong, 0)
                .toLocaleString()}
              ₫
            </div>

            {/* Nút hủy đơn */}
            {order.status.toLowerCase() !== "canceled" && (
              <div className="text-right mt-4">
                <button
                  className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition duration-300"
                  onClick={() => handleOpenModal(order.id)}
                >
                  Hủy đơn
                </button>
              </div>
            )}

          </div>
        ))}
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-bold mb-4">Xác nhận hủy đơn</h2>
              <p className="mb-6">Bạn có chắc chắn muốn hủy đơn này không?</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                  onClick={handleCancelOrder}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
