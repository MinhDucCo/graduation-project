"use client";

import { useEffect, useState } from "react";

type OrderStatusTab = "all" | "pending" | "shipping" | "success" | "canceled";

export default function DonHangCuaToi() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  // Tab loc trang thai
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("all");

  // Luu rating theo id don
  const [ratings, setRatings] = useState<{ [orderId: number]: number }>({});
  const [submittingRatingId, setSubmittingRatingId] = useState<number | null>(
    null
  );

    const [thankYouOrderId, setThankYouOrderId] = useState<number | null>(null);

  // Ham chuan hoa trang thai ve dang khong dau, khong space
  const normalizeStatus = (status: any): string => {
    const st = String(status || "").toLowerCase();
    return st
      .replace(/\s+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Map ra label hien thi dep hon
  const getStatusLabel = (status: any): string => {
    const n = normalizeStatus(status);

    // pending
    if (["pending", "choxacnhan", "choraxacnhan"].includes(n))
      return "Chờ xác nhận";

    // da thanh toan
    if (["paid", "dathanhtoan"].includes(n)) return "Đã thanh toán";

    // dang giao
    if (["shipping", "dangvanchuyen", "danggiao"].includes(n))
      return "Đang giao";

    // hoan tat / da nhan hang
    if (["done", "success", "hoantat", "hoanthanh", "danhan"].includes(n))
      return "Hoàn tất";

    // da huy
    if (["cancelled", "canceled", "dahuy"].includes(n)) return "Đã hủy";

    return String(status || "");
  };

  // Map ra class mau badge theo trang thai
  const getStatusBadgeClass = (status: any): string => {
    const n = normalizeStatus(status);

    // hoan tat
    if (["done", "success", "hoantat", "hoanthanh", "danhan"].includes(n))
      return "bg-emerald-500 text-3x2 ";

    // da thanh toan
    if (["paid", "dathanhtoan"].includes(n)) return "bg-sky-500";

    // cho xac nhan
    if (["pending", "choxacnhan", "choraxacnhan"].includes(n))
      return "bg-amber-500 text-bg ";

    // dang giao
    if (["shipping", "dangvanchuyen", "danggiao"].includes(n))
      return "bg-blue-500 text-bg ";

    // da huy
    if (["cancelled", "canceled", "dahuy"].includes(n))
      return "bg-gray-500 text-bg ";

    return "bg-red-500 text-bg ";
  };

  // Kiem tra don co duoc phep huy khong
  const canOrderBeCanceled = (status: any): boolean => {
    const n = normalizeStatus(status);
    return ["pending", "choxacnhan", "choraxacnhan"].includes(n);
  };

  // Kiem tra don da hoan tat hay chua
  const isOrderCompleted = (status: any): boolean => {
    const n = normalizeStatus(status);
    return ["done", "success", "hoantat", "hoanthanh", "danhan"].includes(n);
  };

  // Chon so sao (chi luu vao state)
  const handleSelectRating = (orderId: number, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  // Submit rating len server
    const handleSubmitRating = async (orderId: number) => {
    const rating = ratings[orderId];

    if (!rating || rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    try {
      setSubmittingRatingId(orderId);

      const res = await fetch(
        `http://localhost:3000/api/orders/${orderId}/rating`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Có lỗi khi gửi đánh giá.");
        return;
      }

      // cap nhat rating trong danh sach orders neu server tra ve order moi
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, rating: data.order.rating } : o
          )
        );
      }

      // 👇 HIEN KHUNG CAM ON 2 GIAY
      setThankYouOrderId(orderId);
      setTimeout(() => {
        setThankYouOrderId(null);
      }, 2000);
    } catch (err) {
      console.error("Loi gui rating:", err);
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    } finally {
      setSubmittingRatingId(null);
    }
  };


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
        const res = await fetch(
          `http://localhost:3000/api/orders?id_user=${user.id}`
        );
        const data = await res.json();

        setOrders(data);

        // khoi tao ratings tu rating trong DB (neu co)
        const initialRatings: { [orderId: number]: number } = {};
        data.forEach((o: any) => {
          if (o.rating) {
            initialRatings[o.id] = o.rating;
          }
        });
        setRatings(initialRatings);
      } catch (err) {
        console.error("Loi lay don hang:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle huy don
  const handleCancelOrder = async () => {
    const current = orders.find((o) => o.id === selectedOrderId);

    if (!current) {
      alert("Không tìm thấy đơn hàng!");
      return;
    }

    const n = normalizeStatus(current.status);
    // Chi cho phep huy: pending / cho xac nhan
    if (!["pending", "choxacnhan", "choraxacnhan"].includes(n)) {
      alert("Chỉ đơn hàng chờ xác nhận mới có thể hủy!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/orders/cancel/${selectedOrderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ly_do_huy: "Đã hủy" }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrderId
              ? { ...o, status: "canceled", ly_do_huy: "Đã hủy" }
              : o
          )
        );
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Loi huy don:", err);
    } finally {
      setShowModal(false);
      setSelectedOrderId(null);
    }
  };

  // Loc don theo tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    const n = normalizeStatus(order.status);

    if (activeTab === "pending")
      return [
        "pending",
        "choxacnhan",
        "choraxacnhan",
        "paid",
        "dathanhtoan",
      ].includes(n);

    if (activeTab === "shipping")
      return ["shipping", "dangvanchuyen", "danggiao"].includes(n);

    if (activeTab === "success")
      return ["done", "success", "hoantat", "hoanthanh", "danhan"].includes(n);

    if (activeTab === "canceled")
      return ["cancelled", "canceled", "dahuy"].includes(n);

    return true;
  });

  const getPaymentLabel = (method: any): string => {
    const m = String(method || "").toLowerCase();

    if (["cod", "tienmat", "cash"].includes(m))
      return "Thanh toán khi nhận hàng (COD)";

    if (["bank", "bank_transfer", "chuyenkhoan", "atm"].includes(m))
      return "Chuyển khoản ngân hàng";

    return String(method || "");
  };

  // Dem so luong tung trang thai de hien len tab
  const countByTab = (tab: OrderStatusTab): number => {
    if (tab === "all") return orders.length;
    return orders.filter((order) => {
      const n = normalizeStatus(order.status);
      if (tab === "pending")
        return [
          "pending",
          "choxacnhan",
          "choraxacnhan",
          "paid",
          "dathanhtoan",
        ].includes(n);

      if (tab === "shipping")
        return ["shipping", "dangvanchuyen", "danggiao"].includes(n);

      if (tab === "success")
        return ["done", "success", "hoantat", "hoanthanh", "danhan"].includes(
          n
        );

      if (tab === "canceled")
        return ["cancelled", "canceled", "dahuy"].includes(n);
      return false;
    }).length;
  };

  if (loading)
    return <p className="text-center mt-10">Đang tải đơn hàng...</p>;

  if (!orders.length)
    return (
      <p className="text-center mt-10 text-gray-500">
        Bạn chưa có đơn hàng nào.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Đơn hàng của tôi
      </h1>
      {/* Thanh tab loc trang thai */}
      <div className="mb-6 bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-2 flex flex-wrap gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "pending", label: "Chờ xác nhận" },
          { key: "shipping", label: "Đang giao" },
          { key: "success", label: "Hoàn tất" },
          { key: "canceled", label: "Đã hủy" },
        ].map((tab) => {
          const k = tab.key as OrderStatusTab;
          const isActive = activeTab === k;
          return (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition 
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20" : "bg-white"
                }`}
              >
                {countByTab(k)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sach don hang */}
      <div className="space-y-5">
        {filteredOrders.map((order) => {
          const statusLabel = getStatusLabel(order.status);
          const statusClass = getStatusBadgeClass(order.status);
          const isCancelable = canOrderBeCanceled(order.status);
          const completed = isOrderCompleted(order.status);
          const currentRating = ratings[order.id] ?? 0;
          const alreadyRated = !!order.rating; // da co rating trong DB

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Mã đơn hàng
                  </p>
                  <h2 className="text-xl font-semibold text-gray-800">
                    #{order.id}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                  <p className="text-sm text-gray-500">
                    Ngày đặt:{" "}
                    <span className="font-medium">
                      {new Date(order.ngay_dat).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Thong tin don hang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 mb-4 text-sm">
                <p>
                  <span className="font-semibold">Người nhận:</span>{" "}
                  {order.ten_nguoi_nhan}
                </p>
                <p>
                  <span className="font-semibold">Điện thoại:</span>{" "}
                  {order.dien_thoai}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold">Địa chỉ:</span>{" "}
                  {order.dia_chi}
                </p>
                <p>
                  <span className="font-semibold">Thanh toán:</span>{" "}
                  {getPaymentLabel(order.phuong_thuc)}
                </p>
              </div>

              {/* Chi tiet san pham */}
              <div className="mt-3 border-t pt-3">
                <h3 className="font-semibold mb-3 text-gray-700">
                  Sản phẩm trong đơn
                </h3>
                <div className="space-y-2">
                  {order.chi_tiet?.map((ct: any) => (
                    <div
                      key={ct.id_chi_tiet}
                      className="flex justify-between gap-3 py-2 border-b last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <img
                          src={ct.bien_the_san_pham?.hinh}
                          className="w-16 h-16 object-cover rounded-lg border"
                          alt={ct.phu_tung_xe?.ten_san_pham}
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800">
                            {ct.phu_tung_xe?.ten_san_pham}
                          </p>
                          <p className="text-gray-500">
                            Số lượng: {ct.so_luong}
                          </p>
                        </div>
                      </div>

                      <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                        {ct.gia.toLocaleString()}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tong tien + nut huy */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-gray-700 text-base">
                  <span className="font-semibold">Tổng tiền: </span>
                  <span className="text-lg font-bold text-blue-700">
                    {order.chi_tiet
                      ?.reduce(
                        (total: number, item: any) =>
                          total + item.gia * item.so_luong,
                        0
                      )
                      .toLocaleString()}
                    ₫
                  </span>
                </div>

                <div className="text-right">
                  <button
                    disabled={!isCancelable}
                    onClick={
                      isCancelable ? () => handleOpenModal(order.id) : undefined
                    }
                    className={`px-5 py-2 text-sm font-semibold rounded-lg shadow transition 
                      ${
                        isCancelable
                          ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Hủy đơn
                  </button>
                </div>
              </div>

              {/* Danh gia 5 sao (chi hien khi don hoan tat va chua danh gia) */}
              {completed && !alreadyRated && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-3">
                  <div className="text-sm font-semibold text-gray-700">
                    Đánh giá đơn hàng:
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSelectRating(order.id, star)}
                        className={`text-2xl focus:outline-none transition ${
                          currentRating >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={
                        !currentRating || submittingRatingId === order.id
                      }
                      onClick={() => handleSubmitRating(order.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg shadow transition 
                        ${
                          !currentRating || submittingRatingId === order.id
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-400 text-white hover:bg-blue-500"
                        }`}
                    >
                      {submittingRatingId === order.id
                        ? "Đang gửi..."
                        : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              )}
              {/* Thong bao da danh gia */}
              {completed && alreadyRated && (
                <div className="mt-4 border-t pt-3 text-sm text-emerald-600 font-semibold">
                  Bạn đã đánh giá đơn hàng này. Xin cảm ơn!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal xac nhan huy */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-2 text-gray-800">
              Xác nhận hủy đơn
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Bạn có chắc chắn muốn hủy đơn hàng này không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800"
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
           {/* Toast cam on danh gia o giua man hinh */}
      {thankYouOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 max-w-md w-[90%] text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Cảm ơn bạn đã đánh giá!
            </h2>
            <p className="text-sm text-gray-600">
              Đơn hàng <span className="font-semibold">#{thankYouOrderId}</span> đã được ghi nhận đánh giá.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
