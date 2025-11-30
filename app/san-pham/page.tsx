"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  ten_san_pham?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  an_hien?: number;
  mau_sac?: string;
  hinh_phu1?: string;
  hinh_phu2?: string;
  hinh_phu3?: string;
  ghi_chu?: string;
  id_loai_xe?: number;
};

const STORAGE_KEY = "public_products_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Lấy baseURL từ env, fallback localhost
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function SanPhamPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Map product từ API → Product dùng chung (đồng bộ với AdminDashboard)
  const mapProduct = (p: any): Product => {
    // Lấy biến thể - xử lý nhiều trường hợp
    let bienTheArray: any[] = [];
    if (p.bien_the_san_phams) {
      bienTheArray = Array.isArray(p.bien_the_san_phams)
        ? p.bien_the_san_phams
        : [];
    } else if (p.BienTheSanPhams) {
      bienTheArray = Array.isArray(p.BienTheSanPhams)
        ? p.BienTheSanPhams
        : [];
    }

    let bienThe =
      bienTheArray.length > 0
        ? bienTheArray[0].dataValues || bienTheArray[0]
        : null;

    // ✨ Fallback nếu giá / số lượng / hình nằm ở root
    if (
      !bienThe &&
      (p.gia !== undefined ||
        p.so_luong !== undefined ||
        p.hinh !== undefined)
    ) {
      bienThe = {
        gia: p.gia,
        gia_ban: p.gia_ban,
        so_luong: p.so_luong,
        hinh: p.hinh,
        mau_sac: p.mau_sac,
        hinh_phu1: p.hinh_phu1,
        hinh_phu2: p.hinh_phu2,
        hinh_phu3: p.hinh_phu3,
        ghi_chu: p.ghi_chu,
      };
    }

    // Lấy loại xe - xử lý nhiều trường hợp
    let loaiXe: any = null;
    if (p.loai_xe && typeof p.loai_xe === "object") {
      loaiXe = p.loai_xe.dataValues || p.loai_xe;
    } else if (p.LoaiXeModel) {
      loaiXe = p.LoaiXeModel.dataValues || p.LoaiXeModel;
    } else if (p.loaiXeModel) {
      loaiXe = p.loaiXeModel.dataValues || p.loaiXeModel;
    }

    const price = Number(
      (bienThe && (bienThe.gia ?? bienThe.gia_ban)) ??
        p.gia ??
        p.price ??
        0
    );

    const stock = Number(
      (bienThe && bienThe.so_luong) ?? p.so_luong ?? p.stock ?? 0
    );

    return {
      id: String(p.ma_san_pham || p.id || uid()),
      name: p.ten_san_pham || p.name || "Untitled",
      price,
      stock,
      category:
        loaiXe?.ten_loai ||
        p.loai_xe ||
        p.id_loai_xe?.toString() ||
        "",
      imageUrl:
        (bienThe && bienThe.hinh) ||
        p.hinh ||
        (bienThe && bienThe.hinh_phu1) ||
        "",
      description: p.mo_ta || p.description || "",
      an_hien:
        typeof p.an_hien === "number"
          ? p.an_hien
          : Number(p.an_hien ?? 1),
      mau_sac: (bienThe as any)?.mau_sac || p.mau_sac || "",
      hinh_phu1: (bienThe as any)?.hinh_phu1 || p.hinh_phu1 || "",
      hinh_phu2: (bienThe as any)?.hinh_phu2 || p.hinh_phu2 || "",
      hinh_phu3: (bienThe as any)?.hinh_phu3 || p.hinh_phu3 || "",
      ghi_chu: (bienThe as any)?.ghi_chu || p.ghi_chu || "",
      id_loai_xe: p.id_loai_xe,
    };
  };

  // Lấy tất cả sp an_hien_2 + an_hien_3 (xe máy + ô tô) từ API public
  const fetchAllFromPublicAPI = async (): Promise<Product[]> => {
    const all: Product[] = [];

    // helper fetch with timeout
    const fetchWithTimeout = async (url: string, ms = 7000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      } finally {
        clearTimeout(timer);
      }
    };

    // xe máy (an_hien_2)
    try {
      const first = await fetchWithTimeout(
        `${API_BASE}/api/san_pham/an_hien_2?page=1&limit=1000`
      );
      if (first.data && Array.isArray(first.data)) {
        let list = [...first.data];
        const totalPages = first.pagination?.totalPages || 1;

        if (totalPages > 1) {
          const promises: Promise<any>[] = [];
          for (let page = 2; page <= totalPages; page++) {
            promises.push(
              fetchWithTimeout(
                `${API_BASE}/api/san_pham/an_hien_2?page=${page}&limit=1000`
              )
            );
          }
          const results = await Promise.all(promises);
          results.forEach((d) => {
            if (d.data && Array.isArray(d.data)) {
              list = [...list, ...d.data];
            }
          });
        }

        list.forEach((p: any) => all.push(mapProduct(p)));
      }
    } catch (err) {
      console.warn("⚠️ Lỗi load sản phẩm xe máy:", err);
    }

    // ô tô (an_hien_3)
    try {
      const first = await fetchWithTimeout(
        `${API_BASE}/api/san_pham/an_hien_3?page=1&limit=1000`
      );
      if (first.data && Array.isArray(first.data)) {
        let list = [...first.data];
        const totalPages = first.pagination?.totalPages || 1;

        if (totalPages > 1) {
          const promises: Promise<any>[] = [];
          for (let page = 2; page <= totalPages; page++) {
            promises.push(
              fetchWithTimeout(
                `${API_BASE}/api/san_pham/an_hien_3?page=${page}&limit=1000`
              )
            );
          }
          const results = await Promise.all(promises);
          results.forEach((d) => {
            if (d.data && Array.isArray(d.data)) {
              list = [...list, ...d.data];
            }
          });
        }

        list.forEach((p: any) => all.push(mapProduct(p)));
      }
    } catch (err) {
      console.warn("⚠️ Lỗi load sản phẩm ô tô:", err);
    }

    return all;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        // Thử dùng cache localStorage trước
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && mounted) {
              setProducts(parsed);
            }
          } catch {
            // ignore parse error
          }
        }

        // Load từ API public
        const all = await fetchAllFromPublicAPI();

        if (mounted) {
          if (all.length === 0) {
            setLoadError(
              "Không thể tải sản phẩm từ server. Vui lòng kiểm tra backend (Node) có chạy chưa."
            );
          }
          setProducts(all);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }
      } catch (err) {
        console.error("❌ Lỗi load sản phẩm public:", err);
        if (mounted) {
          setLoadError(
            "Xảy ra lỗi khi tải sản phẩm. Kiểm tra kết nối hoặc backend."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Lấy danh sách category duy nhất để filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim() !== "") {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  // Lọc + sắp xếp
  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => (p.category || "") === categoryFilter);
    }

    list.sort((a, b) => {
      let va: string | number = a[sortBy];
      let vb: string | number = b[sortBy];

      if (typeof va === "string" && typeof vb === "string") {
        const cmp = va.localeCompare(vb, "vi");
        return sortDir === "asc" ? cmp : -cmp;
      }

      const na = Number(va) || 0;
      const nb = Number(vb) || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    });

    return list;
  }, [products, search, categoryFilter, sortBy, sortDir]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
              Danh sách sản phẩm
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Xem và lựa chọn phụ tùng / xe phù hợp nhu cầu của bạn.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Thanh filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Tìm kiếm
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên sản phẩm, danh mục, mô tả..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
            />
          </div>

          <div className="min-w-[160px]">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Danh mục
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white"
            >
              <option value="all">Tất cả</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "price")
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white"
            >
              <option value="name">Tên sản phẩm</option>
              <option value="price">Giá</option>
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Thứ tự
            </label>
            <select
              value={sortDir}
              onChange={(e) =>
                setSortDir(e.target.value as "asc" | "desc")
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white"
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>

        {/* Trạng thái load */}
        {loading && (
          <div className="text-center text-gray-500 py-10">
            Đang tải danh sách sản phẩm...
          </div>
        )}

        {!loading && loadError && (
          <div className="mb-6 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {loadError}
            <div className="mt-2 text-xs text-yellow-700">
              Gợi ý:
              <ul className="list-disc list-inside">
                <li>Kiểm tra đã chạy server Node (backend) chưa.</li>
                <li>
                  Đảm bảo biến <code>NEXT_PUBLIC_API_BASE_URL</code> trỏ đúng
                  URL backend.
                </li>
                <li>F5 lại trang sau khi khởi động server.</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {/* Grid sản phẩm */}
        {!loading && filtered.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Hiển thị{" "}
              <span className="font-semibold">{filtered.length}</span> /{" "}
              <span className="font-semibold">{products.length}</span> sản phẩm
            </p>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  <div className="relative w-full pt-[70%] bg-gray-100 overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    {p.category && (
                      <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-1">
                        {p.category}
                      </div>
                    )}
                    <h2 className="font-semibold text-sm mb-1 line-clamp-2">
                      {p.name}
                    </h2>
                    <div className="text-red-600 font-bold text-base mb-1">
                      {p.price.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Tồn kho:{" "}
                      <span className="font-semibold">{p.stock}</span>{" "}
                      {p.stock > 0 ? "sản phẩm" : "(hết hàng)"}
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <button
                        className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick={() =>
                          alert(
                            "Chức năng thêm vào giỏ sẽ được hoàn thiện sau (phần frontend giỏ hàng)."
                          )
                        }
                      >
                        Thêm vào giỏ
                      </button>
                      <Link
                        href={`/san-pham/${p.id}`}
                        className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
