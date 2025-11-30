"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// key cache giống trang /san-pham
const STORAGE_KEY = "public_products_v1";

// base URL backend
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ✅ map product từ API → Product (đồng bộ với /san-pham/page.tsx)
function mapProduct(p: any): Product {
  // Lấy biến thể
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
      p.gia_ban !== undefined ||
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

  // Lấy loại xe
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
    name: p.ten_san_pham || p.name || "Sản phẩm",
    price,
    stock,
    category:
      loaiXe?.ten_loai || p.loai_xe || p.id_loai_xe?.toString() || "",
    imageUrl:
      (bienThe && bienThe.hinh) ||
      p.hinh ||
      (bienThe && bienThe.hinh_phu1) ||
      "",
    description: p.mo_ta || p.description || "",
    an_hien:
      typeof p.an_hien === "number" ? p.an_hien : Number(p.an_hien ?? 1),
    mau_sac: (bienThe as any)?.mau_sac || p.mau_sac || "",
    hinh_phu1: (bienThe as any)?.hinh_phu1 || p.hinh_phu1 || "",
    hinh_phu2: (bienThe as any)?.hinh_phu2 || p.hinh_phu2 || "",
    hinh_phu3: (bienThe as any)?.hinh_phu3 || p.hinh_phu3 || "",
    ghi_chu: (bienThe as any)?.ghi_chu || p.ghi_chu || "",
    id_loai_xe: p.id_loai_xe,
  };
}

// ✅ fetch 1 sản phẩm public từ backend
async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    // Đổi sang /api/san_pham/:id cho đúng convention
    const url = `${API_BASE}/api/san_pham/${id}`;
    console.log(`🔍 Fetching product from ${url}`);
    const res = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn("❌ /api/san_pham/:id HTTP", res.status);
      return null;
    }

    const data = await res.json();

    // Tùy backend: {data: {...}} hoặc {...} luôn
    const raw = data?.data || data;
    if (!raw) return null;

    return mapProduct(raw);
  } catch (err) {
    console.error("⚠️ Lỗi gọi /api/san_pham/:id", err);
    return null;
  }
}

interface PageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load chi tiết sản phẩm
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setLoadError(null);

      // 1) Thử tìm trong localStorage (cache từ trang /san-pham)
      let found: Product | undefined;
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            found = parsed.find((p: Product) => String(p.id) === String(id));
          }
        }
      } catch {
        // ignore
      }

      if (mounted && found) {
        setProduct(found);
      }

      // 2) Thử gọi API chi tiết → dữ liệu mới nhất
      const fromApi = await fetchProductById(id);

      if (!mounted) return;

      if (fromApi) {
        setProduct(fromApi);
        // update lại cache
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          let list: Product[] = [];
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) list = parsed;
          }
          const idx = list.findIndex(
            (p) => String(p.id) === String(fromApi.id)
          );
          if (idx >= 0) list[idx] = fromApi;
          else list.push(fromApi);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
          // ignore cache error
        }
      } else if (!found) {
        setLoadError(
          "Không tìm thấy thông tin sản phẩm. Có thể sản phẩm đã bị xóa hoặc backend chưa chạy."
        );
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const list = [
      product.imageUrl,
      product.hinh_phu1,
      product.hinh_phu2,
      product.hinh_phu3,
    ].filter((x) => x && x.trim() !== "") as string[];

    return Array.from(new Set(list));
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Link
              href="/san-pham"
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>

          <div className="bg-white border border-red-200 text-red-700 rounded-xl p-6 shadow-sm">
            <h1 className="text-xl font-bold mb-2">Không tải được sản phẩm</h1>
            <p className="text-sm mb-3">
              {loadError ||
                "Không tìm thấy sản phẩm hoặc có lỗi xảy ra trong quá trình tải dữ liệu."}
            </p>
            <p className="text-xs text-red-500">
              • Kiểm tra backend Node (API) đã chạy chưa. <br />
              • Đảm bảo endpoint <code>/api/san_pham/:id</code> tồn tại hoặc
              chỉnh lại URL trong file <code>[id]/page.tsx</code> cho khớp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center gap-1">
            <Link
              href="/"
              className="hover:underline hover:text-blue-600 transition"
            >
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              href="/san-pham"
              className="hover:underline hover:text-blue-600 transition"
            >
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-gray-700 line-clamp-1">
              {product.name || "Chi tiết"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            {product.name}
          </h1>
          {product.category && (
            <div className="mt-1 text-sm text-gray-500">
              Danh mục:{" "}
              <span className="font-semibold text-gray-700">
                {product.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột ảnh */}
          <div>
            <div className="relative w-full pt-[75%] bg-gray-100 rounded-lg overflow-hidden mb-3">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                  Không có ảnh
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1).map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-full pt-[70%] bg-gray-100 rounded-md overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} - phụ ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột thông tin */}
          <div className="flex flex-col">
            <div className="mb-3">
              <div className="text-xl font-bold text-red-600 mb-1">
                {product.price.toLocaleString("vi-VN")} đ
              </div>
              <div className="text-sm text-gray-500">
                Tồn kho:{" "}
                <span className="font-semibold">
                  {product.stock > 0 ? `${product.stock} sản phẩm` : "Hết hàng"}
                </span>
              </div>
              {product.mau_sac && (
                <div className="text-sm text-gray-500">
                  Màu sắc:{" "}
                  <span className="font-semibold">{product.mau_sac}</span>
                </div>
              )}
            </div>

            <hr className="my-3" />

            {product.description && (
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  Mô tả sản phẩm
                </h2>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.ghi_chu && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {product.ghi_chu}
                </p>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <button
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                onClick={() =>
                  alert(
                    "Chức năng thêm vào giỏ sẽ được hoàn thiện sau (frontend giỏ hàng)."
                  )
                }
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => router.back()}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin thêm đơn giản */}
        <div className="mt-6 text-xs text-gray-500">
          Mã sản phẩm: <span className="font-mono">{product.id}</span>
        </div>
      </div>
    </div>
  );
}
