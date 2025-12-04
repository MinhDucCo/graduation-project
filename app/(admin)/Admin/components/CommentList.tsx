"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/utils1/api";

interface CommentUser {
  id: number;
  ho_ten: string;
  email: string;
}

interface CommentProduct {
  ma_san_pham: string | number;
  ten_san_pham: string;
}

interface Comment {
  id: number;
  noi_dung: string;
  ngay_tao: string;
  trang_thai: number; // 1 = hiển thị, 0 = ẩn
  rating: number;
  user: CommentUser | null;
  product: CommentProduct | null;
}

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/comments", { withCredentials: true })
      .then((res) => setComments(res.data || []))
      .catch((err) => {
        console.error("Lỗi load bình luận:", err);
        setComments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async (c: Comment) => {
    const nextStatus = c.trang_thai === 1 ? 0 : 1;
    setTogglingId(c.id);
    try {
      // ❗ Nếu backend bạn dùng đường dẫn khác thì đổi URL này
      const res = await api.put(
        `/admin/comments/${c.id}/status`,
        { trang_thai: nextStatus },
        { withCredentials: true }
      );

      const updatedStatus =
        typeof res.data?.trang_thai === "number"
          ? res.data.trang_thai
          : nextStatus;

      setComments((prev) =>
        prev.map((item) =>
          item.id === c.id ? { ...item, trang_thai: updatedStatus } : item
        )
      );
    } catch (err) {
      console.error("Lỗi đổi trạng thái bình luận:", err);
      alert("Đổi trạng thái thất bại, xem console để debug.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        Đang tải bình luận...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Quản lý bình luận
          </h2>
          <p className="text-sm text-gray-500">
            Xem nội dung, người gửi và ẩn/hiện bình luận trên website.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng:{" "}
          <span className="font-semibold text-gray-800">
            {comments.length}
          </span>{" "}
          bình luận
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-sm text-gray-500 py-6 text-center">
          Chưa có bình luận nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-3 py-2 text-left font-semibold border-b">
                  User
                </th>
                <th className="px-3 py-2 text-left font-semibold border-b">
                  Sản phẩm
                </th>
                <th className="px-3 py-2 text-left font-semibold border-b">
                  Nội dung
                </th>
                <th className="px-3 py-2 text-center font-semibold border-b">
                  Rating
                </th>
                <th className="px-3 py-2 text-left font-semibold border-b">
                  Ngày tạo
                </th>
                <th className="px-3 py-2 text-center font-semibold border-b">
                  Trạng thái
                </th>
                <th className="px-3 py-2 text-center font-semibold border-b">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => {
                const isVisible = c.trang_thai === 1;
                return (
                  <tr
                    key={c.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    {/* User */}
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium text-gray-800">
                        {c.user?.ho_ten ?? "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.user?.email}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-3 py-2 align-top">
                      {c.product ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {c.product.ten_san_pham}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mã: {c.product.ma_san_pham}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">Unknown</span>
                      )}
                    </td>

                    {/* Content */}
                    <td className="px-3 py-2 align-top max-w-xs">
                      <p className="text-gray-800 whitespace-pre-line break-words">
                        {c.noi_dung}
                      </p>
                    </td>

                    {/* Rating */}
                    <td className="px-3 py-2 text-center align-top">
                      {c.rating > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">
                          {c.rating} / 5
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Chưa đánh giá
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2 align-top text-gray-600">
                      {new Date(c.ngay_tao).toLocaleString("vi-VN")}
                    </td>

                    {/* Status badge */}
                    <td className="px-3 py-2 text-center align-top">
                      <span
                        className={[
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border",
                          isVisible
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200",
                        ].join(" ")}
                      >
                        {isVisible ? "Hiển thị" : "Đã ẩn"}
                      </span>
                    </td>

                    {/* Toggle button */}
                    <td className="px-3 py-2 text-center align-top">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        disabled={togglingId === c.id}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm transition ${
                          isVisible
                            ? "bg-red-50 text-red-600  hover:bg-red-100"
                            : "bg-blue-50 text-blue-600  hover:bg-blue-100"
                        } ${togglingId === c.id ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                      >
                        {togglingId === c.id
                          ? "Đang cập nhật..."
                          : isVisible
                          ? "Ẩn bình luận"
                          : "Hiện bình luận"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
