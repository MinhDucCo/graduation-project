// components/ShowSP.tsx
import React from "react";
import Link from "next/link";
import { ISanPham } from "./cautrucdata";

interface ShowSPProps {
  sp: ISanPham;
}

const ShowSP: React.FC<ShowSPProps> = ({ sp }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col">
      {/* Hình ảnh sản phẩm */}
      <div className="w-full h-80 overflow-hidden rounded-xl">
        <img
           src={sp.hinh ?? "/images/no-image.png"}
          alt={sp.ten_san_pham}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col mt-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {sp.ten_san_pham}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sp.mo_ta}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-red-600 font-bold text-xl">
  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(sp.gia)}
</span>
          <span className="text-sm text-gray-400">
            SL: {sp.so_luong}
          </span>
        </div>
      </div>

      {/* Nút xem chi tiết */}
      <Link
        href={`/sanpham/${sp.ma_san_pham}`}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-xl font-medium transition"
      >
        Xem chi tiết
      </Link>
    </div>
  );
};

export default ShowSP;
