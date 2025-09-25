"use client";
import { ISanPham } from "../components/cautrucdata";
import { useState } from "react";

export default function ShowDetailSP({ sp }: { sp: ISanPham }) {
  // danh sách hình: hình chính + hình phụ (demo 3 hình khác nhau)
  const hinhPhu = [
    sp.hinh,
    "https://via.placeholder.com/400x300?text=Hình+phụ+1",
    "https://via.placeholder.com/400x300?text=Hình+phụ+2",
    "https://via.placeholder.com/400x300?text=Hình+phụ+3",
  ];

  const [hinhChinh, setHinhChinh] = useState<string>(
    sp.hinh && sp.hinh.trim() !== "" ? sp.hinh : "/default.jpg"
  );

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh */}
        <div className="md:w-1/2">
          <img
            src={hinhChinh}
            alt={sp.ten_san_pham || "Sản phẩm"}
            className="w-full h-[400px] object-cover rounded-lg shadow-md"
          />
          {/* Danh sách hình phụ */}
          <div className="flex gap-4 mt-4">
            {hinhPhu.map((hinh, index) => (
              <img
                key={index}
                src={hinh}
                alt={`Hình phụ ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition 
                  ${hinhChinh === hinh ? "border-blue-600" : "border-gray-200"}`}
                onClick={() => setHinhChinh(hinh)}
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {sp.ten_san_pham}
            </h3>
            <p className="text-2xl text-red-600 font-semibold mb-4">
              {Number(sp.gia).toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-gray-700 mb-2">
              <b>Mô tả:</b> {sp.mo_ta}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Màu sắc:</b> {sp.mau_sac || "Chưa có"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Số lượng:</b> {sp.so_luong}
            </p>
          </div>

          <button
            type="button"
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
