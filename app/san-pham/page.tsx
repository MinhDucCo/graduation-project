"use client";
import { useEffect, useState } from "react";
import { ISanPham } from "../components/cautrucdata";
import ShowSP from "../components/ShowSP";

export default function SanPhamPage() {
  const [products, setProducts] = useState<ISanPham[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:3000/api/san_pham?page=${page}&limit=8`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data);
        setTotalPages(data.totalPages);
      });
  }, [page]);

  return (
    <div className="w-[90%] mx-auto my-6">
      <h2 className="text-center font-bold text-red-600 text-2xl uppercase mb-6">
        Tất cả sản phẩm
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {products.map((sp) => (
          <ShowSP key={sp.ma_san_pham} sp={sp} />
        ))}
      </div>

      {/* Nút phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
