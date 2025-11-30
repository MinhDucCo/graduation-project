"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import OrdersList from "./components/OrdersList";
import UsersList from "./components/UsersList";
import SettingsForm from "./components/SettingsForm";
import type { SettingsData } from "./components/SettingsForm";
import DashboardStats from "./components/DashboardStats";
import NewsList from "./components/NewsList";

import styles from "./admin.module.css";
import { api } from "@/utils1/api";

/* ================== TYPES DÙNG CHUNG ================== */

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipping"
  | "done"
  | "cancelled";

export interface Product {
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
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  ten_nguoi_nhan: string;
  dia_chi: string | null;
  dien_thoai: string | null;
  status: OrderStatus;
  ngay_dat: string;
  createdAt: string;
  total: number;
  so_luong: number;
  customerEmail?: string | null;
}

interface NewsItem {
  id: number;
  tieu_de: string;
  noi_dung?: string;
  [key: string]: any;
}

/* ================== HÀM MAP TRẠNG THÁI ĐƠN ================== */

function mapDbStatusToOrderStatus(dbStatus: string): OrderStatus {
  if (dbStatus === "canceled") return "cancelled";
  if (dbStatus.toLowerCase().includes("chờ")) return "pending";
  if (dbStatus === "Đã thanh toán") return "paid";
  if (dbStatus === "Đang giao") return "shipping";
  if (dbStatus === "Hoàn tất") return "done";
  return "pending";
}

function mapOrderStatusToDbStatus(s: OrderStatus): string {
  switch (s) {
    case "pending":
      return "Chờ xác nhận";
    case "paid":
      return "Đã thanh toán";
    case "shipping":
      return "Đang giao";
    case "done":
      return "Hoàn tất";
    case "cancelled":
      return "canceled";
  }
}

/* ================== CONST & HELPER ================== */

const STORAGE_KEY = "admin_products_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Map 1 row từ API về Product cho FE */
function mapProductFromApi(p: any): Product {
  // Lấy biến thể nếu có
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

  const bienThe =
    bienTheArray.length > 0
      ? bienTheArray[0].dataValues || bienTheArray[0]
      : null;

  // Lấy loại xe
  let loaiXe: any = null;
  if (p.loai_xe) {
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
    category: loaiXe?.ten_loai || p.id_loai_xe?.toString() || "",
    imageUrl: (bienThe && bienThe.hinh) || p.hinh || p.imageUrl || "",
    description: p.mo_ta || p.description || "",
    an_hien:
      typeof p.an_hien === "number"
        ? p.an_hien
        : Number(p.an_hien || 1),
    mau_sac: (bienThe && bienThe.mau_sac) || p.mau_sac || "",
    hinh_phu1: (bienThe && bienThe.hinh_phu1) || p.hinh_phu1 || "",
    hinh_phu2: (bienThe && bienThe.hinh_phu2) || p.hinh_phu2 || "",
    hinh_phu3: (bienThe && bienThe.hinh_phu3) || p.hinh_phu3 || "",
    ghi_chu: (bienThe && bienThe.ghi_chu) || p.ghi_chu || "",
    id_loai_xe: p.id_loai_xe,
  };
}

/* ================== COMPONENT CHÍNH ================== */

export default function AdminDashboard() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<
    "Home" | "Products" | "Orders" | "Users" | "News" | "Settings"
  >("Home");

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderFilter, setOrderFilter] =
    useState<OrderStatus | "all">("all");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  // Settings
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Range filter cho Dashboard
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [rangePreset, setRangePreset] = useState<
    "7d" | "30d" | "this-month" | "custom"
  >("7d");

  // News
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsQuery, setNewsQuery] = useState("");

  /* ================== AUTH CHECK ================== */

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const userStr = localStorage.getItem("user");

      if (userStr) {
        const user = JSON.parse(userStr);
        const role = user?.vai_tro;

        const isAdmin =
          Number(role) === 1 ||
          role === "1" ||
          role === "admin" ||
          role === "ADMIN";

        if (isAdmin) {
          if (mounted) setAuthLoading(false);

          try {
            await api.get("/auth/me", { withCredentials: true });
          } catch {
            console.warn(
              "API failed but localStorage admin → vẫn cho vào"
            );
          }

          return;
        }
      }

      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        const role = res?.data?.user?.vai_tro;
        const isAdmin = Number(role) === 1;

        if (isAdmin) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          if (mounted) setAuthLoading(false);
          return;
        }
      } catch (e) {
        console.log("API Error:", e);
      }

      if (mounted) {
        router.replace("/Login");
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ================== LOAD PRODUCTS ================== */

  useEffect(() => {
    let mounted = true;

    const fetchAllFromPublicAPI = async (): Promise<Product[]> => {
      const allProducts: Product[] = [];

      // xe máy
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const xeMayRes = await fetch(
          "http://localhost:3000/api/san_pham/an_hien_2?page=1&limit=1000",
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (!xeMayRes.ok) {
          throw new Error(`HTTP ${xeMayRes.status}`);
        }

        const xeMayData = await xeMayRes.json();

        if (xeMayData.data && Array.isArray(xeMayData.data)) {
          const totalPages = xeMayData.pagination?.totalPages || 1;
          let products = [...xeMayData.data];

          if (totalPages > 1) {
            const promises = [];
            for (let page = 2; page <= totalPages; page++) {
              promises.push(
                fetch(
                  `http://localhost:3000/api/san_pham/an_hien_2?page=${page}&limit=1000`
                ).then((res) => res.json())
              );
            }
            const results = await Promise.all(promises);
            results.forEach((data: any) => {
              if (data.data && Array.isArray(data.data)) {
                products = [...products, ...data.data];
              }
            });
          }

          products.forEach((p: any) => {
            allProducts.push(mapProductFromApi(p));
          });
        }
      } catch (err: any) {
        if (
          err.name !== "AbortError" &&
          !err.message?.includes("Failed to fetch")
        ) {
          console.warn("⚠️ Failed to fetch xeMay products:", err);
        }
      }

      // ô tô
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const otoRes = await fetch(
          "http://localhost:3000/api/san_pham/an_hien_3?page=1&limit=1000",
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (!otoRes.ok) {
          throw new Error(`HTTP ${otoRes.status}`);
        }

        const otoData = await otoRes.json();

        if (otoData.data && Array.isArray(otoData.data)) {
          const totalPages = otoData.pagination?.totalPages || 1;
          let products = [...otoData.data];

          if (totalPages > 1) {
            const promises = [];
            for (let page = 2; page <= totalPages; page++) {
              promises.push(
                fetch(
                  `http://localhost:3000/api/san_pham/an_hien_3?page=${page}&limit=1000`
                ).then((res) => res.json())
              );
            }
            const results = await Promise.all(promises);
            results.forEach((data: any) => {
              if (data.data && Array.isArray(data.data)) {
                products = [...products, ...data.data];
              }
            });
          }

          products.forEach((p: any) => {
            allProducts.push(mapProductFromApi(p));
          });
        }
      } catch (err: any) {
        if (
          err.name !== "AbortError" &&
          !err.message?.includes("Failed to fetch")
        ) {
          console.warn("⚠️ Failed to fetch oto products:", err);
        }
      }

      return allProducts;
    };

    (async () => {
      setLoadingProducts(true);
      setLoadError(null);

      // 1. Thử API admin
      try {
        const res = await api.get("/admin/products", {
          withCredentials: true,
        });

        if (
          mounted &&
          res.data &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          const mapped = res.data.map(mapProductFromApi);
          setProducts(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          setLoadingProducts(false);
          return;
        }
      } catch (err: any) {
        if (err.code !== "ECONNREFUSED" && err.message !== "Network Error") {
          console.warn(
            "⚠️ Admin API load failed, trying public API:",
            err?.response?.status,
            err?.message
          );
        }
      }

      // 2. Thử API public
      try {
        const allProducts = await fetchAllFromPublicAPI();
        if (mounted && allProducts.length > 0) {
          setProducts(allProducts);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allProducts));
          setLoadingProducts(false);
          return;
        }
      } catch (err: any) {
        if (
          err.code !== "ECONNREFUSED" &&
          err.message !== "Network Error" &&
          err.name !== "AbortError"
        ) {
          console.error("❌ Failed to fetch from public API:", err);
        }
      }

      // 3. Fallback localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            setLoadingProducts(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load from localStorage", e);
        localStorage.removeItem(STORAGE_KEY);
      }

      // 4. Seed mẫu
      if (mounted) {
        const seed: Product[] = [
          {
            id: uid(),
            name: "Bugi cao cấp",
            price: 120000,
            stock: 40,
            category: "Động cơ",
            imageUrl: "",
            description: "Bugi cho xe máy, hiệu suất cao",
          },
          {
            id: uid(),
            name: "Lọc gió",
            price: 80000,
            stock: 25,
            category: "Lọc",
            imageUrl: "",
            description: "Lọc gió chính hãng",
          },
          {
            id: uid(),
            name: "Nhông xích",
            price: 150000,
            stock: 15,
            category: "Truyền động",
            imageUrl: "",
            description: "Nhông xích bền bỉ",
          },
        ];
        setProducts(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        setLoadError(
          "Không thể tải sản phẩm từ server. Đang hiển thị dữ liệu mẫu."
        );
      }

      if (mounted) {
        setLoadingProducts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================== LOAD ORDERS ================== */

  useEffect(() => {
    if (tab !== "Orders" && tab !== "Home") return;
    let mounted = true;

    (async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get("/admin/orders", {
          withCredentials: true,
        });

        if (!mounted) return;
        if (!Array.isArray(res.data)) {
          console.error("Invalid orders data:", res.data);
          setOrders([]);
          return;
        }

        const mapped: Order[] = res.data.map((row: any) => {
          const rawDate = row.ngay_dat || row.createdAt || row.created_at;
          const isoDate = rawDate
            ? new Date(rawDate).toISOString()
            : new Date().toISOString();

          return {
            id: Number(row.id),
            ten_nguoi_nhan:
              row.ten_nguoi_nhan || row.customerName || "",
            dia_chi: row.dia_chi ?? row.address ?? null,
            dien_thoai: row.dien_thoai ?? row.phone ?? null,
            status: mapDbStatusToOrderStatus(
              row.status || row.trang_thai || "Chờ xử lý"
            ),
            ngay_dat: isoDate,
            createdAt: isoDate,
            total: Number(row.tong_tien ?? row.total ?? 0),
            so_luong: Number(row.tong_so_luong ?? 0),
            customerEmail: row.email ?? row.customerEmail ?? null,
          };
        });

        setOrders(mapped);
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
        if (mounted) {
          setOrders([]);
        }
      } finally {
        if (mounted) {
          setOrdersLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tab]);

  /* ================== LOAD USERS ================== */

  useEffect(() => {
    if (tab !== "Users") return;
    let mounted = true;

    if (users.length > 0) return;

    (async () => {
      setUsersLoading(true);
      try {
        const res = await api.get("/admin/users", {
          withCredentials: true,
        });
        if (mounted && Array.isArray(res.data)) {
          setUsers(res.data);
          localStorage.setItem(
            "admin_users_v1",
            JSON.stringify(res.data)
          );
          return;
        }
      } catch (e) {
        if (!mounted) return;
        try {
          const raw = localStorage.getItem("admin_users_v1");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && mounted) {
              setUsers(parsed);
              return;
            } else {
              throw new Error("Invalid data format");
            }
          }
          if (mounted) {
            const seed = [
              {
                id: "u1",
                ho_ten: "Admin",
                email: "admin@example.com",
                vai_tro: 1,
                trang_thai: "active",
              },
              {
                id: "u2",
                ho_ten: "User A",
                email: "usera@example.com",
                vai_tro: 0,
                trang_thai: "active",
              },
            ];
            setUsers(seed);
            localStorage.setItem(
              "admin_users_v1",
              JSON.stringify(seed)
            );
          }
        } catch (localError) {
          console.error(
            "Failed to load users from localStorage",
            localError
          );
          if (mounted) {
            setUsers([]);
          }
        }
      } finally {
        if (mounted) {
          setUsersLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tab, users.length]);

  /* ================== LOAD SETTINGS ================== */

  useEffect(() => {
    if (tab !== "Settings") return;
    let mounted = true;

    if (settings !== null) return;

    (async () => {
      setSettingsLoading(true);
      try {
        const res = await api.get("/admin/settings", {
          withCredentials: true,
        });
        if (mounted && res?.data) {
          setSettings(res.data);
          localStorage.setItem(
            "admin_settings_v1",
            JSON.stringify(res.data)
          );
          return;
        }
      } catch (e) {
        if (!mounted) return;
        try {
          const raw = localStorage.getItem("admin_settings_v1");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && mounted) {
              setSettings(parsed);
            } else {
              throw new Error("Invalid data format");
            }
          } else if (mounted) {
            const seed: SettingsData = {
              shopName: "GearX",
              shopEmail: "support@example.com",
              shopPhone: "0123456789",
              shopAddress: "Hà Nội",
              shippingFee: 30000,
              codEnabled: true,
              vnpayEnabled: false,
            };
            setSettings(seed);
            localStorage.setItem(
              "admin_settings_v1",
              JSON.stringify(seed)
            );
          }
        } catch (localError) {
          console.error(
            "Failed to load settings from localStorage",
            localError
          );
          if (mounted) {
            const seed: SettingsData = {
              shopName: "GearX",
              shopEmail: "support@example.com",
              shopPhone: "0123456789",
              shopAddress: "Hà Nội",
              shippingFee: 30000,
              codEnabled: true,
              vnpayEnabled: false,
            };
            setSettings(seed);
          }
        }
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tab, settings]);

  /* ================== LƯU PRODUCTS VÀO LOCAL ================== */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products", e);
    }
  }, [products]);

  /* ================== LOAD NEWS ================== */

  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true);
      try {
        const res = await api.get("/tin_tuc", { withCredentials: true });
        const data = res.data || [];
        setNews(data);
        localStorage.setItem("admin_news_v1", JSON.stringify(data));
      } catch (error) {
        console.log("Lỗi load tin tức", error);
        const cached = localStorage.getItem("admin_news_v1");
        if (cached) setNews(JSON.parse(cached));
      }
      setNewsLoading(false);
    };

    loadNews();
  }, []);

  /* ================== HANDLERS SẢN PHẨM ================== */

  function handleAddClick() {
    setEditing(null);
    setShowForm(true);
  }

  function handleSave(product: Product & { id_loai_xe?: number }) {
    (async () => {
      try {
        if (product.id) {
          // UPDATE
          const updateData: any = {
            ten_san_pham: product.name,
            mo_ta: product.description,
          };

          if (product.id_loai_xe !== undefined) {
            updateData.id_loai_xe = product.id_loai_xe;
          }

          if (product.price || product.stock || product.imageUrl) {
            updateData.bien_the = [
              {
                mau_sac: product.mau_sac || "",
                gia: product.price || 0,
                so_luong: product.stock || 0,
                hinh: product.imageUrl || "",
                hinh_phu1: product.hinh_phu1 || "",
                hinh_phu2: product.hinh_phu2 || "",
                hinh_phu3: product.hinh_phu3 || "",
                ghi_chu: product.ghi_chu || "",
              },
            ];
          }

          await api.put(`/admin/products/${product.id}`, updateData, {
            withCredentials: true,
          });

          const res = await api.get("/admin/products", {
            withCredentials: true,
          });

          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map(mapProductFromApi);
            setProducts(mapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          } else {
            setProducts((prev) =>
              prev.map((p) => (p.id === product.id ? product : p))
            );
          }
        } else {
          // CREATE
          if (!product.id_loai_xe) {
            alert("Vui lòng chọn loại xe!");
            return;
          }

          const requestData = {
            ten_san_pham: product.name?.trim() || "",
            mo_ta: product.description?.trim() || "",
            id_loai_xe: Number(product.id_loai_xe),
            an_hien:
              product.an_hien !== undefined && product.an_hien !== null
                ? Number(product.an_hien)
                : 1,
            bien_the: [
              {
                mau_sac: (product.mau_sac || "").trim(),
                gia: Number(product.price) || 0,
                so_luong: Number(product.stock) || 0,
                hinh: (product.imageUrl || "").trim(),
                hinh_phu1: (product.hinh_phu1 || "").trim(),
                hinh_phu2: (product.hinh_phu2 || "").trim(),
                hinh_phu3: (product.hinh_phu3 || "").trim(),
                ghi_chu: (product.ghi_chu || "").trim(),
              },
            ],
          };

          console.log(
            "📤 Gửi request tạo sản phẩm:",
            JSON.stringify(requestData, null, 2)
          );

          let res;
          try {
            res = await api.post("/admin/products", requestData, {
              withCredentials: true,
              timeout: 10000,
            });
            console.log(
              "✅ Response từ server:",
              JSON.stringify(res.data, null, 2)
            );
          } catch (requestError: any) {
            console.error("❌ Lỗi khi gửi request:", requestError);
            throw requestError;
          }

          const created = res.data;
          if (!created) {
            throw new Error("Server không trả về dữ liệu sản phẩm");
          }

          const allRes = await api.get("/admin/products", {
            withCredentials: true,
          });
          if (
            allRes.data &&
            Array.isArray(allRes.data) &&
            allRes.data.length > 0
          ) {
            const allMapped = allRes.data.map(mapProductFromApi);
            setProducts(allMapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allMapped));
          } else {
            // fallback: tự map từ created + form
            const mapped = mapProductFromApi({
              ...created,
              gia: product.price,
              so_luong: product.stock,
              hinh: product.imageUrl,
            });
            setProducts((prev) => [mapped, ...prev]);
          }
        }
      } catch (err: any) {
        console.error("❌ API save failed:", err);
        let errorMsg = "Lỗi không xác định";
        let errorDetails = "";

        if (err?.response?.data) {
          const errorData = err.response.data;

          if (errorData.message) errorMsg = errorData.message;
          else if (errorData.error) errorMsg = errorData.error;

          if (errorData.original) {
            errorDetails += `\n\nLỗi database: ${errorData.original}`;
          }
          if (
            errorData.validationErrors &&
            Array.isArray(errorData.validationErrors)
          ) {
            const validationMsgs = errorData.validationErrors
              .map((e: any) => e.message)
              .join(", ");
            errorDetails += `\n\nLỗi validation: ${validationMsgs}`;
          }
          if (errorData.details) {
            errorDetails += `\n\nChi tiết: ${errorData.details}`;
          }
        } else if (err?.message) {
          errorMsg = err.message;
        }

        const fullErrorMsg = errorDetails
          ? `${errorMsg}${errorDetails}`
          : errorMsg;

        alert(`Lỗi khi lưu sản phẩm:\n\n${fullErrorMsg}`);

        if (product.id) {
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? product : p))
          );
        } else {
          product.id = uid();
          setProducts((prev) => [product, ...prev]);
        }
      } finally {
        setShowForm(false);
        setEditing(null);
      }
    })();
  }

  function handleEdit(p: Product) {
    setEditing(p);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa sản phẩm này? Hành động không thể hoàn tác.")) return;
    (async () => {
      try {
        await api.delete(`/admin/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.warn("API delete failed, using local fallback", err);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    })();
  }

  /* ================== FILTER & TOOLBAR PRODUCTS ================== */

  const filtered = products
    .filter((p) =>
      ((p.name || p.ten_san_pham || "") as string)
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      let va: number | string = (a as any)[sortBy];
      let vb: number | string = (b as any)[sortBy];
      if (typeof va === "string" && typeof vb === "string") {
        const cmp = va.localeCompare(vb, "vi");
        return sortDir === "asc" ? cmp : -cmp;
      }
      const na = Number(va) || 0;
      const nb = Number(vb) || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllCurrent() {
    setSelectedIds(new Set(filtered.map((p) => p.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} sản phẩm đã chọn?`)) return;

    (async () => {
      try {
        for (const id of selectedIds) {
          try {
            await api.delete(`/admin/products/${id}`);
          } catch {
            // ignore
          }
        }
      } finally {
        setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        clearSelection();
      }
    })();
  }

  function exportCSV() {
    const header = [
      "id",
      "name",
      "price",
      "stock",
      "category",
      "imageUrl",
      "description",
    ];
    const rows = filtered.map((p) =>
      header
        .map((h) => {
          const val = (p as any)[h] ?? "";
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ================== RENDER ================== */

  if (authLoading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>Đang kiểm tra quyền truy cập...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-lg">
        <div className="flex items-center justify-center h-24 border-b border-blue-600">
          <img
            src="/images/logobn.png"
            alt="Admin Logo"
            className="w-41 h-auto object-contain shadow-lg rounded-lg"
          />
        </div>

        <h2 className="text-2xl font-bold px-6 py-4">Admin Panel</h2>

        <nav>
          <ul className="space-y-2 px-4 py-4">
            {(
              ["Home", "Products", "Orders", "Users", "News", "Settings"] as const
            ).map((t) => (
              <li key={t}>
                <button
                  onClick={() => setTab(t)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    tab === t
                      ? "bg-white text-blue-600 font-semibold"
                      : "text-blue-50 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 bg-white shadow p-6 rounded-xl border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-red-600">
              {tab === "Products"
                ? "Quản lý sản phẩm"
                : tab === "Home"
                ? "Tổng quan"
                : tab}
            </h1>
            <p className="text-gray-500">
              Bảng điều khiển quản trị viên — một số thao tác có sử dụng
              localStorage để cache dữ liệu.
            </p>
          </div>
          <div className={styles.headerActions}>
            {tab === "Products" && (
              <>
                <input
                  placeholder="Tìm sản phẩm hoặc danh mục..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
                />
                <select
                  aria-label="sort by"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "name" | "price" | "stock"
                    )
                  }
                  className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
                >
                  <option value="name">Sắp xếp: Tên</option>
                  <option value="price">Sắp xếp: Giá</option>
                  <option value="stock">Sắp xếp: Tồn kho</option>
                </select>
                <select
                  aria-label="sort direction"
                  value={sortDir}
                  onChange={(e) =>
                    setSortDir(e.target.value as "asc" | "desc")
                  }
                  className={styles.searchInput}
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
                  >
                    Xóa {selectedIds.size} mục
                  </button>
                )}
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 shadow"
                >
                  Xuất CSV
                </button>
                <button
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                >
                  Thêm sản phẩm
                </button>
              </>
            )}
          </div>
        </header>

        {/* HOME */}
        {tab === "Home" && (
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className={styles.toolbar}>
              <button
                className={`${styles.pillBtn} ${
                  rangePreset === "7d" ? styles.pillActive : ""
                }`}
                onClick={() => {
                  setRangePreset("7d");
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 6);
                  setStartDate(start.toISOString().slice(0, 10));
                  setEndDate(end.toISOString().slice(0, 10));
                }}
              >
                7 ngày
              </button>
              <button
                className={`${styles.pillBtn} ${
                  rangePreset === "30d" ? styles.pillActive : ""
                }`}
                onClick={() => {
                  setRangePreset("30d");
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 29);
                  setStartDate(start.toISOString().slice(0, 10));
                  setEndDate(end.toISOString().slice(0, 10));
                }}
              >
                30 ngày
              </button>
              <button
                className={`${styles.pillBtn} ${
                  rangePreset === "this-month" ? styles.pillActive : ""
                }`}
                onClick={() => {
                  setRangePreset("this-month");
                  const now = new Date();
                  const start = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                  );
                  const end = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                  );
                  setStartDate(start.toISOString().slice(0, 10));
                  setEndDate(end.toISOString().slice(0, 10));
                }}
              >
                Tháng này
              </button>
              <span className={styles.subdued}>hoặc chọn khoảng:</span>
              <input
                aria-label="start date"
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset("custom");
                }}
              />
              <span>—</span>
              <input
                aria-label="end date"
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset("custom");
                }}
              />
            </div>
            <DashboardStats
              stats={undefined}
              fallbackOrders={orders.filter((o) => {
                if (!startDate || !endDate) return true;
                const d = new Date(o.createdAt)
                  .toISOString()
                  .slice(0, 10);
                return d >= startDate && d <= endDate;
              })}
              fallbackProducts={products}
            />
          </section>
        )}

        {/* PRODUCTS */}
        {tab === "Products" && (
          <section>
            {loadingProducts ? (
              <div>Đang tải sản phẩm...</div>
            ) : loadError ? (
              <div className={styles.errorText}>
                <div style={{ marginBottom: "12px" }}>{loadError}</div>
              </div>
            ) : filtered.length === 0 && products.length === 0 ? (
              <div className={styles.emptyMsg}>
                <p>Không có sản phẩm nào.</p>
                <p className={styles.emptySubtext}>
                  {loadingProducts
                    ? "Đang tải..."
                    : "Vui lòng thêm sản phẩm mới."}
                </p>
              </div>
            ) : filtered.length === 0 && products.length > 0 ? (
              <div className={styles.emptyMsg}>
                <p>
                  Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"
                </p>
                <p className={styles.emptySubtext}>
                  Tổng số sản phẩm: {products.length}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.productCount}>
                  Hiển thị {filtered.length} / {products.length} sản phẩm
                </div>
                <ProductList
                  products={filtered}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onSelectAll={selectAllCurrent}
                  onClearSelection={clearSelection}
                />
              </>
            )}
          </section>
        )}

        {/* ORDERS */}
        {tab === "Orders" && (
          <section>
            <div className={styles.headerActions}>
              <input
                placeholder="Tìm mã đơn, tên khách hoặc SĐT..."
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className={styles.searchInput}
              />
              <select
                aria-label="filter orders"
                value={orderFilter}
                onChange={(e) =>
                  setOrderFilter(e.target.value as OrderStatus | "all")
                }
                className={styles.searchInput}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="paid">Đã thanh toán</option>
                <option value="shipping">Đang giao</option>
                <option value="done">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            {ordersLoading ? (
              <div>Đang tải đơn hàng...</div>
            ) : (
              <OrdersList
                orders={orders.filter((o) => {
                  const matchStatus =
                    orderFilter === "all" || o.status === orderFilter;
                  const q = orderQuery.toLowerCase();
                  const matchText =
                    String(o.id).toLowerCase().includes(q) ||
                    (o.ten_nguoi_nhan || "")
                      .toLowerCase()
                      .includes(q) ||
                    (o.dien_thoai || "").toLowerCase().includes(q);
                  return matchStatus && matchText;
                })}
                onView={(o) => setViewingOrder(o)}
                onChangeStatus={async (o, status) => {
                  try {
                    const dbStatus = mapOrderStatusToDbStatus(status);
                    const res = await api.put(
                      `/admin/orders/${o.id}/status`,
                      { status: dbStatus },
                      { withCredentials: true }
                    );

                    const raw = res.data || {};
                    const updated: Order = {
                      id: Number(raw.id ?? o.id),
                      ten_nguoi_nhan:
                        raw.ten_nguoi_nhan ?? o.ten_nguoi_nhan,
                      dia_chi: raw.dia_chi ?? o.dia_chi,
                      dien_thoai: raw.dien_thoai ?? o.dien_thoai,
                      status,
                      ngay_dat: raw.ngay_dat
                        ? new Date(raw.ngay_dat).toISOString()
                        : o.ngay_dat,
                      createdAt: raw.ngay_dat
                        ? new Date(raw.ngay_dat).toISOString()
                        : o.createdAt,
                      total: Number(raw.tong_tien ?? o.total),
                      customerEmail:
                        raw.email ?? o.customerEmail ?? null,
                      so_luong: Number(raw.so_luong ?? o.so_luong),
                    };

                    setOrders((prev) =>
                      prev.map((x) => (x.id === o.id ? updated : x))
                    );
                  } catch (err) {
                    console.error(
                      "Update status failed, fallback local:",
                      err
                    );
                    setOrders((prev) =>
                      prev.map((x) =>
                        x.id === o.id ? { ...x, status } : x
                      )
                    );
                  }
                }}
              />
            )}
          </section>
        )}

        {/* USERS */}
        {tab === "Users" && (
          <section>
            <div className={styles.headerActions}>
              <input
                placeholder="Tìm tên hoặc email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            {usersLoading ? (
              <div>Đang tải người dùng...</div>
            ) : (
              <UsersList
                users={users.filter(
                  (u) =>
                    (u.ho_ten || "")
                      .toLowerCase()
                      .includes(userQuery.toLowerCase()) ||
                    (u.email || "")
                      .toLowerCase()
                      .includes(userQuery.toLowerCase())
                )}
                onChangeRole={async (u, role) => {
                  try {
                    const res = await api.put(
                      `/admin/users/${u.id}/role`,
                      { vai_tro: role },
                      { withCredentials: true }
                    );
                    const updated = res.data || { ...u, vai_tro: role };
                    setUsers((prev) => {
                      const newUsers = prev.map((x) =>
                        x.id === u.id ? updated : x
                      );
                      localStorage.setItem(
                        "admin_users_v1",
                        JSON.stringify(newUsers)
                      );
                      return newUsers;
                    });
                  } catch {
                    setUsers((prev) => {
                      const newUsers = prev.map((x) =>
                        x.id === u.id ? { ...x, vai_tro: role } : x
                      );
                      localStorage.setItem(
                        "admin_users_v1",
                        JSON.stringify(newUsers)
                      );
                      return newUsers;
                    });
                  }
                }}
                onToggleActive={async (u) => {
                  const nextStatus =
                    u.trang_thai === "active" ? "locked" : "active";
                  try {
                    const res = await api.put(
                      `/admin/users/${u.id}/status`,
                      { trang_thai: nextStatus },
                      { withCredentials: true }
                    );
                    const updated = res.data || {
                      ...u,
                      trang_thai: nextStatus,
                    };
                    setUsers((prev) => {
                      const newUsers = prev.map((x) =>
                        x.id === u.id ? updated : x
                      );
                      localStorage.setItem(
                        "admin_users_v1",
                        JSON.stringify(newUsers)
                      );
                      return newUsers;
                    });
                  } catch {
                    setUsers((prev) => {
                      const newUsers = prev.map((x) =>
                        x.id === u.id
                          ? { ...x, trang_thai: nextStatus }
                          : x
                      );
                      localStorage.setItem(
                        "admin_users_v1",
                        JSON.stringify(newUsers)
                      );
                      return newUsers;
                    });
                  }
                }}
              />
            )}
          </section>
        )}

        {/* NEWS */}
        {tab === "News" && (
          <section>
            <div className={styles.headerActions}>
              <input
                placeholder="Tìm tiêu đề..."
                value={newsQuery}
                onChange={(e) => setNewsQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {newsLoading ? (
              <div>Đang tải danh sách tin tức...</div>
            ) : (
              <NewsList
                list={news.filter((n) =>
                  (n.tieu_de || "")
                    .toLowerCase()
                    .includes(newsQuery.toLowerCase())
                )}
                onDelete={async (id) => {
                  await api.delete(`/tin_tuc/${id}`);
                  setNews((prev) => prev.filter((x) => x.id !== id));
                }}
                onUpdate={async (item) => {
                  await api.put(`/tin_tuc/${item.id}`, item);
                  setNews((prev) =>
                    prev.map((x) => (x.id === item.id ? item : x))
                  );
                }}
              />
            )}
          </section>
        )}

        {/* SETTINGS */}
        {tab === "Settings" && (
          <section>
            {settingsLoading ? (
              <div>Đang tải cài đặt...</div>
            ) : (
              <SettingsForm
                initial={settings ?? undefined}
                onSave={async (data) => {
                  try {
                    const res = await api.put(
                      "/admin/settings",
                      data,
                      {
                        withCredentials: true,
                      }
                    );
                    const saved = res?.data || data;
                    setSettings(saved);
                    localStorage.setItem(
                      "admin_settings_v1",
                      JSON.stringify(saved)
                    );
                    alert("Đã lưu cài đặt");
                  } catch {
                    setSettings(data);
                    localStorage.setItem(
                      "admin_settings_v1",
                      JSON.stringify(data)
                    );
                    alert("Lưu cục bộ (fallback), API chưa khả dụng");
                  }
                }}
              />
            )}
          </section>
        )}

        {/* FORM SẢN PHẨM */}
        {showForm && (
          <ProductForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}

        {/* MODAL CHI TIẾT ĐƠN */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl w-[480px] border border-gray-200">
              <h3 className={styles.headerTitle}>
                Chi tiết đơn #{viewingOrder.id}
              </h3>

              <p>
                Khách: {viewingOrder.ten_nguoi_nhan}
                {viewingOrder.customerEmail
                  ? ` — ${viewingOrder.customerEmail}`
                  : ""}
              </p>

              <p>
                Trạng thái:{" "}
                {viewingOrder.status === "pending"
                  ? "Chờ xử lý"
                  : viewingOrder.status === "paid"
                  ? "Đã thanh toán"
                  : viewingOrder.status === "shipping"
                  ? "Đang giao"
                  : viewingOrder.status === "done"
                  ? "Hoàn tất"
                  : "Đã hủy"}
              </p>

              <p>Số lượng: {viewingOrder.so_luong}</p>
              <p>
                Tổng tiền:{" "}
                {viewingOrder.total.toLocaleString("vi-VN")} đ
              </p>
              <p>
                Ngày đặt:{" "}
                {new Date(
                  viewingOrder.ngay_dat
                ).toLocaleString("vi-VN")}
              </p>

              <div className={styles.formActions}>
                <button
                  className={styles.btn}
                  onClick={() => setViewingOrder(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Ghi chú: thứ tự useEffect cố định, không chèn/bỏ hook conditionally. */
