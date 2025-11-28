"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import OrdersList from './components/OrdersList';
import UsersList from './components/UsersList';
import SettingsForm from './components/SettingsForm';
import type { SettingsData } from './components/SettingsForm';
import DashboardStats from './components/DashboardStats';
import NewsList from "./components/NewsList";

import styles from './admin.module.css';
import { api } from "@/utils1/api";


export interface Product {
  id: string;
  name: string;
  ten_san_pham?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  // thêm:
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
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'done' | 'cancelled';
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


function mapDbStatusToOrderStatus(dbStatus: string): OrderStatus {
  const st = String(dbStatus).toLowerCase().trim();

  if (st === "cancelled" || st === "canceled") return "cancelled";

  if (st.includes("chờ") || st.includes("cho")) return "pending";

  if (st === "đã thanh toán" || st === "paid") return "paid";

  if (st === "đang giao" || st === "shipping") return "shipping";

  if (st === "hoàn tất" || st === "done") return "done";

  return "pending";
}

export function mapOrderStatusToDbStatus(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "pending";
    case "paid":
      return "paid";
    case "shipping":
      return "shipping";
    case "done":
      return "done";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}


const STORAGE_KEY = 'admin_products_v1';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}
export default function AdminDashboard() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<'Home' | 'Products' | 'Orders' | 'Users' | 'News' | 'Settings'>('Home');
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [rangePreset, setRangePreset] = useState<'7d' | '15d' | 'this-month' | 'custom'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // News state
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsQuery, setNewsQuery] = useState("")

  // Kiểm tra xác thực & vai trò admin
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      // 1) Ưu tiên lấy từ localStorage
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
          console.log("ADMIN ✔ LocalStorage");
          if (mounted) setAuthLoading(false);

          // Kiểm tra API nhưng KHÔNG redirect khi lỗi
          try {
            await api.get("/auth/me", { withCredentials: true });
            console.log("Session OK ✔ API");
          } catch (e) {
            console.warn("API failed but localStorage admin → still allow");
          }

          return; // ⛔ STOP! Không redirect nữa
        }
      }

      // 2) Nếu local không phải admin → mới kiểm tra API
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        const role = res?.data?.user?.vai_tro;
        const isAdmin = Number(role) === 1;

        if (isAdmin) {
          console.log("ADMIN ✔ API");
          localStorage.setItem("user", JSON.stringify(res.data.user));

          if (mounted) setAuthLoading(false);
          return; // ⛔ STOP! Không redirect
        } else {
          console.log("❌ Not admin from API");
        }
      } catch (e) {
        console.log("API Error:", e);
      }

      // 3) Chỉ redirect nếu CHẮC CHẮN không phải admin
      if (mounted) {
        console.log("❌ Redirect to Login (not admin)");
        router.replace("/Login");
      }
    };
    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);


  //
  useEffect(() => {
    // Try loading from API first; fallback to localStorage
    let mounted = true;

    // Helper function để map product từ API
    const mapProduct = (p: any): Product => {
      // Lấy biến thể - xử lý nhiều trường hợp
      let bienTheArray: any[] = [];
      if (p.bien_the_san_phams) {
        bienTheArray = Array.isArray(p.bien_the_san_phams) ? p.bien_the_san_phams : [];
      } else if (p.BienTheSanPhams) {
        bienTheArray = Array.isArray(p.BienTheSanPhams) ? p.BienTheSanPhams : [];
      }

      const bienThe = bienTheArray.length > 0
        ? (bienTheArray[0].dataValues || bienTheArray[0])
        : null;

      // Lấy loại xe - xử lý nhiều trường hợp
      let loaiXe: any = null;
      if (p.loai_xe) {
        loaiXe = p.loai_xe.dataValues || p.loai_xe;
      } else if (p.LoaiXeModel) {
        loaiXe = p.LoaiXeModel.dataValues || p.LoaiXeModel;
      } else if (p.loaiXeModel) {
        loaiXe = p.loaiXeModel.dataValues || p.loaiXeModel;
      }

      return {
        id: String(p.ma_san_pham || p.id || uid()),
        name: p.ten_san_pham || p.name || "Untitled",
        price: bienThe ? Number(bienThe.gia || 0) : 0,
        stock: bienThe ? Number(bienThe.so_luong || 0) : 0,
        category: loaiXe?.ten_loai || p.id_loai_xe?.toString() || "",
        imageUrl: bienThe?.hinh || p.hinh || "",
        description: p.mo_ta || p.description || "",

        // ✅ nhận an_hien & các hình phụ, màu, ghi chú:
        an_hien: typeof p.an_hien === "number" ? p.an_hien : Number(p.an_hien || 1),
        mau_sac: bienThe?.mau_sac || p.mau_sac || "",
        hinh_phu1: bienThe?.hinh_phu1 || p.hinh_phu1 || "",
        hinh_phu2: bienThe?.hinh_phu2 || p.hinh_phu2 || "",
        hinh_phu3: bienThe?.hinh_phu3 || p.hinh_phu3 || "",
        ghi_chu: bienThe?.ghi_chu || p.ghi_chu || "",
        id_loai_xe: p.id_loai_xe,
      };

    };

    // Helper function để kiểm tra server có sẵn không
    const checkServerAvailable = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 giây timeout
        const res = await fetch('http://localhost:3000/api/loai_xe', {
          signal: controller.signal,
          method: 'GET',
        });
        clearTimeout(timeoutId);
        return res.ok;
      } catch {
        return false;
      }
    };

    // Helper function để lấy tất cả sản phẩm từ API công khai
    const fetchAllFromPublicAPI = async (): Promise<Product[]> => {
      const allProducts: Product[] = [];

      try {
        // Lấy sản phẩm xe máy (an_hien = 2)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const xeMayRes = await fetch('http://localhost:3000/api/san_pham/an_hien_2?page=1&limit=1000', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!xeMayRes.ok) {
          throw new Error(`HTTP ${xeMayRes.status}`);
        }

        const xeMayData = await xeMayRes.json();

        if (xeMayData.data && Array.isArray(xeMayData.data)) {
          // Nếu có phân trang, lấy tất cả các trang
          const totalPages = xeMayData.pagination?.totalPages || 1;
          let products = [...xeMayData.data];

          if (totalPages > 1) {
            const promises = [];
            for (let page = 2; page <= totalPages; page++) {
              promises.push(
                fetch(`http://localhost:3000/api/san_pham/an_hien_2?page=${page}&limit=1000`)
                  .then(res => res.json())
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
            allProducts.push(mapProduct(p));
          });
        }
      } catch (err: any) {
        // Chỉ log nếu không phải là lỗi connection refused (server không chạy)
        if (err.name !== 'AbortError' && !err.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Failed to fetch xeMay products:', err);
        }
      }

      try {
        // Lấy sản phẩm ô tô (an_hien = 3)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const otoRes = await fetch('http://localhost:3000/api/san_pham/an_hien_3?page=1&limit=1000', {
          signal: controller.signal,
        });
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
                fetch(`http://localhost:3000/api/san_pham/an_hien_3?page=${page}&limit=1000`)
                  .then(res => res.json())
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
            allProducts.push(mapProduct(p));
          });
        }
      } catch (err: any) {
        // Chỉ log nếu không phải là lỗi connection refused (server không chạy)
        if (err.name !== 'AbortError' && !err.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Failed to fetch oto products:', err);
        }
      }

      return allProducts;
    };

    (async () => {
      setLoadingProducts(true);
      setLoadError(null);



      // Bước 1: Thử lấy từ API admin
      try {
        const res = await api.get('/admin/products', { withCredentials: true });
        console.log('✅ API /admin/products response:', res.data);
        console.log('✅ Response type:', typeof res.data, 'Is array:', Array.isArray(res.data));

        if (mounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(mapProduct);
          console.log('✅ Total mapped products from admin API:', mapped.length);

          if (mounted) {
            setProducts(mapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            setLoadingProducts(false);
            return;
          }
        } else {
          console.log('⚠️ Admin API returned empty or invalid data, trying public API...');
        }
      } catch (err: any) {
        // Chỉ log chi tiết nếu không phải là network error
        if (err.code !== 'ECONNREFUSED' && err.message !== 'Network Error') {
          console.warn('⚠️ Admin API load failed, trying public API:', err?.response?.status, err?.message);
        }
      }

      // Bước 2: Nếu API admin không có dữ liệu, thử lấy từ API công khai
      try {
        console.log('🔄 Fetching all products from public API...');
        const allProducts = await fetchAllFromPublicAPI();

        if (mounted && allProducts.length > 0) {
          console.log('✅ Total products from public API:', allProducts.length);
          setProducts(allProducts);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allProducts));
          setLoadingProducts(false);
          return;
        } else {
          console.log('⚠️ Public API also returned no products');
        }
      } catch (err: any) {
        // Chỉ log nếu không phải là network error
        if (err.code !== 'ECONNREFUSED' && err.message !== 'Network Error' && err.name !== 'AbortError') {
          console.error('❌ Failed to fetch from public API:', err);
        }
      }

      // Bước 3: Fallback to localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log('✅ Loading from localStorage:', parsed.length, 'products');
              setProducts(parsed);
              setLoadingProducts(false);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse products from localStorage', parseError);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to load from localStorage', e);
      }

      // Bước 4: Cuối cùng, seed với dữ liệu mẫu
      if (mounted) {
        console.log('⚠️ Using seed data as last resort');
        const seed: Product[] = [
          { id: uid(), name: 'Bugi cao cấp', price: 120000, stock: 40, category: 'Động cơ', imageUrl: '', description: 'Bugi cho xe máy, hiệu suất cao' },
          { id: uid(), name: 'Lọc gió', price: 80000, stock: 25, category: 'Lọc', imageUrl: '', description: 'Lọc gió chính hãng' },
          { id: uid(), name: 'Nhông xích', price: 150000, stock: 15, category: 'Truyền động', imageUrl: '', description: 'Nhông xích bền bỉ' },
        ];
        setProducts(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        setLoadError('Không thể tải sản phẩm từ server. Đang hiển thị dữ liệu mẫu.');
      }

      if (mounted) {
        setLoadingProducts(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // 
  useEffect(() => {
    if (tab !== 'Orders' && tab !== 'Home') return;
    let mounted = true;

    (async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get('/admin/orders', { withCredentials: true });

        if (!mounted) return;
        if (!Array.isArray(res.data)) {
          console.error('Invalid orders data:', res.data);
          setOrders([]);
          return;
        }

        const mapped: Order[] = res.data.map((row: any) => {
          const rawDate = row.ngay_dat || row.createdAt || row.created_at;
          const isoDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

          return {
            id: Number(row.id),
            ten_nguoi_nhan: row.ten_nguoi_nhan || row.customerName || '',
            dia_chi: row.dia_chi ?? row.address ?? null,
            dien_thoai: row.dien_thoai ?? row.phone ?? null,
            status: mapDbStatusToOrderStatus(row.status),
            ngay_dat: isoDate,
            createdAt: isoDate,
            total: Number(row.tong_tien ?? row.total ?? 0),   // 👈 quan trọng
            so_luong: Number(row.tong_so_luong ?? 0),
            customerEmail: row.email ?? row.customerEmail ?? null,
          };
        });


        setOrders(mapped);
        // nếu muốn cache localStorage thì giữ dòng dưới, không có seed nào cả:
        // localStorage.setItem('admin_orders_v1', JSON.stringify(mapped));
      } catch (err) {
        console.error('Failed to fetch admin orders:', err);
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


  // Load users (API, fallback localStorage)
  useEffect(() => {
    if (tab !== 'Users') return;
    let mounted = true;

    // Only fetch if users are empty to prevent infinite loop
    if (users.length > 0) {
      return;
    }

    (async () => {
      setUsersLoading(true);
      try {
        const res = await api.get('/admin/users', { withCredentials: true });
        if (mounted && Array.isArray(res.data)) {
          setUsers(res.data);
          localStorage.setItem('admin_users_v1', JSON.stringify(res.data));
          return;
        }
      } catch (e) {
        if (!mounted) return;
        try {
          const raw = localStorage.getItem('admin_users_v1');
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && mounted) {
                setUsers(parsed);
              } else {
                throw new Error('Invalid data format');
              }
            } catch (parseError) {
              console.error('Failed to parse users from localStorage', parseError);
              // Clear invalid data
              localStorage.removeItem('admin_users_v1');
              // Fall through to seed data
              if (mounted) {
                const seed = [
                  { id: 'u1', ho_ten: 'Admin', email: 'admin@example.com', vai_tro: 1, trang_thai: 'active' },
                  { id: 'u2', ho_ten: 'User A', email: 'usera@example.com', vai_tro: 0, trang_thai: 'active' },
                ];
                setUsers(seed);
                localStorage.setItem('admin_users_v1', JSON.stringify(seed));
              }
            }
          } else if (mounted) {
            const seed = [
              { id: 'u1', ho_ten: 'Admin', email: 'admin@example.com', vai_tro: 1, trang_thai: 'active' },
              { id: 'u2', ho_ten: 'User A', email: 'usera@example.com', vai_tro: 0, trang_thai: 'active' },
            ];
            setUsers(seed);
            localStorage.setItem('admin_users_v1', JSON.stringify(seed));
          }
        } catch (localError) {
          console.error('Failed to load users from localStorage', localError);
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
    return () => { mounted = false; };
  }, [tab]);

  // Load settings (API, fallback local)
  //
  useEffect(() => {
    if (tab !== 'Settings') return;
    let mounted = true;

    // Only fetch if settings are not loaded to prevent infinite loop
    if (settings !== null) {
      return;
    }

    (async () => {
      setSettingsLoading(true);
      try {
        const res = await api.get('/admin/settings', { withCredentials: true });
        if (mounted && res?.data) {
          setSettings(res.data);
          localStorage.setItem('admin_settings_v1', JSON.stringify(res.data));
          return;
        }
      } catch (e) {
        if (!mounted) return;
        try {
          const raw = localStorage.getItem('admin_settings_v1');
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object' && mounted) {
                setSettings(parsed);
              } else {
                throw new Error('Invalid data format');
              }
            } catch (parseError) {
              console.error('Failed to parse settings from localStorage', parseError);
              // Clear invalid data
              localStorage.removeItem('admin_settings_v1');
              // Fall through to seed data
              if (mounted) {
                const seed: SettingsData = {
                  shopName: 'GearX', shopEmail: 'support@example.com', shopPhone: '0123456789', shopAddress: 'Hà Nội', shippingFee: 30000, codEnabled: true, vnpayEnabled: false,
                };
                setSettings(seed);
                localStorage.setItem('admin_settings_v1', JSON.stringify(seed));
              }
            }
          } else if (mounted) {
            const seed: SettingsData = {
              shopName: 'GearX', shopEmail: 'support@example.com', shopPhone: '0123456789', shopAddress: 'Hà Nội', shippingFee: 30000, codEnabled: true, vnpayEnabled: false,
            };
            setSettings(seed);
            localStorage.setItem('admin_settings_v1', JSON.stringify(seed));
          }
        } catch (localError) {
          console.error('Failed to load settings from localStorage', localError);
          if (mounted) {
            // Set default settings on error
            const seed: SettingsData = {
              shopName: 'GearX', shopEmail: 'support@example.com', shopPhone: '0123456789', shopAddress: 'Hà Nội', shippingFee: 30000, codEnabled: true, vnpayEnabled: false,
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
    return () => { mounted = false; };
  }, [tab]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  function handleAddClick() {
    setEditing(null);
    setShowForm(true);
  }
  // Looad Tin tức (API, fallback localStorage)
  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true);
      try {
        const res = await api.get("/api/tin_tuc", { withCredentials: true });
        const data = res.data || [];
        setNews(data);

        // Cache localStorage nếu muốn
        localStorage.setItem("admin_news_v1", JSON.stringify(data));
      } catch (error) {
        console.log("Lỗi load tin tức", error);

        // fallback từ localStorage
        const cached = localStorage.getItem("admin_news_v1");
        if (cached) setNews(JSON.parse(cached));
      }
      setNewsLoading(false);
    };

    loadNews();
  }, []);


  function handleSave(product: Product & { id_loai_xe?: number }) {
    (async () => {
      try {
        if (product.id) {
          // update
          const updateData: any = {
            ten_san_pham: product.name,
            mo_ta: product.description,
          };

          if (product.id_loai_xe !== undefined) {
            updateData.id_loai_xe = product.id_loai_xe;
          }

          // Cập nhật biến thể nếu có giá, số lượng hoặc ảnh
          if (product.price || product.stock || product.imageUrl) {
            updateData.bien_the = [{
              mau_sac: '',
              gia: product.price || 0,
              so_luong: product.stock || 0,
              hinh: product.imageUrl || '',
            }];
          }

          await api.put(`/admin/products/${product.id}`, updateData, { withCredentials: true });

          // Reload products để lấy dữ liệu mới nhất từ server
          const res = await api.get('/admin/products', { withCredentials: true });
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const mapProduct = (p: any): Product => {
              const bienTheArray = p.bien_the_san_phams || p.BienTheSanPhams || [];
              const bienThe = Array.isArray(bienTheArray) && bienTheArray.length > 0
                ? (bienTheArray[0].dataValues || bienTheArray[0])
                : null;
              const loaiXeData = p.loai_xe || p.LoaiXeModel || p.loaiXeModel || null;
              const loaiXe = loaiXeData?.dataValues || loaiXeData;

              return {
                id: String(p.ma_san_pham || p.id || uid()),
                name: p.ten_san_pham || p.name || 'Untitled',
                price: bienThe ? Number(bienThe.gia || 0) : 0,
                stock: bienThe ? Number(bienThe.so_luong || 0) : 0,
                category: loaiXe?.ten_loai || p.id_loai_xe?.toString() || '',
                imageUrl: bienThe?.hinh || p.hinh || '',
                description: p.mo_ta || p.description || '',
              };
            };
            const mapped = res.data.map(mapProduct);
            setProducts(mapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          } else {
            setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
          }
        } else {
          // create
          if (!product.id_loai_xe) {
            alert("Vui lòng chọn loại xe!");
            return;
          }

          const requestData = {
            ten_san_pham: product.name?.trim() || "",
            mo_ta: product.description?.trim() || "",
            id_loai_xe: Number(product.id_loai_xe),
            // ✅ an_hien: 0,1,2,3 — nếu chưa chọn thì default 1
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


          console.log('📤 Gửi request tạo sản phẩm:', requestData);
          console.log('📤 URL:', api.defaults.baseURL + '/admin/products');

          let res;
          try {
            res = await api.post('/admin/products', requestData, {
              withCredentials: true,
              timeout: 10000, // 10 giây timeout
            });
            console.log('✅ Response status:', res.status);
            console.log('✅ Response từ server:', res.data);
          } catch (requestError: any) {
            console.error('❌ Lỗi khi gửi request:', requestError);
            console.error('❌ Error code:', requestError.code);
            console.error('❌ Error message:', requestError.message);
            console.error('❌ Error response:', requestError.response);

            // Re-throw để catch block bên ngoài xử lý
            throw requestError;
          }

          const created = res.data;

          // Kiểm tra created có tồn tại không
          if (!created) {
            throw new Error('Server không trả về dữ liệu sản phẩm');
          }

          // Xử lý biến thể - nhiều trường hợp
          let bienTheArray: any[] = [];
          if (created.bien_the_san_phams) {
            bienTheArray = Array.isArray(created.bien_the_san_phams)
              ? created.bien_the_san_phams
              : [];
          } else if (created.BienTheSanPhams) {
            bienTheArray = Array.isArray(created.BienTheSanPhams)
              ? created.BienTheSanPhams
              : [];
          }

          const bienThe = bienTheArray.length > 0
            ? (bienTheArray[0].dataValues || bienTheArray[0])
            : null;

          // Xử lý loại xe - nhiều trường hợp
          let loaiXe: any = null;
          if (created.loai_xe) {
            loaiXe = created.loai_xe.dataValues || created.loai_xe;
          } else if (created.LoaiXeModel) {
            loaiXe = created.LoaiXeModel.dataValues || created.LoaiXeModel;
          } else if (created.loaiXeModel) {
            loaiXe = created.loaiXeModel.dataValues || created.loaiXeModel;
          }

          const mapped: Product = {
            id: String(created.ma_san_pham || uid()),
            name: created.ten_san_pham || product.name,
            price: bienThe ? Number(bienThe.gia || 0) : (product.price || 0),
            stock: bienThe ? Number(bienThe.so_luong || 0) : (product.stock || 0),
            category: loaiXe?.ten_loai || product.category || '',
            imageUrl: bienThe?.hinh || product.imageUrl || '',
            description: created.mo_ta || product.description || '',
          };

          // Reload toàn bộ danh sách để đảm bảo đồng bộ
          const allRes = await api.get('/admin/products', { withCredentials: true });
          if (allRes.data && Array.isArray(allRes.data) && allRes.data.length > 0) {
            const mapProduct = (p: any): Product => {
              const bienTheArray = p.bien_the_san_phams || p.BienTheSanPhams || [];
              const bienThe = Array.isArray(bienTheArray) && bienTheArray.length > 0
                ? (bienTheArray[0].dataValues || bienTheArray[0])
                : null;
              const loaiXeData = p.loai_xe || p.LoaiXeModel || p.loaiXeModel || null;
              const loaiXe = loaiXeData?.dataValues || loaiXeData;

              return {
                id: String(p.ma_san_pham || p.id || uid()),
                name: p.ten_san_pham || p.name || 'Untitled',
                price: bienThe ? Number(bienThe.gia || 0) : 0,
                stock: bienThe ? Number(bienThe.so_luong || 0) : 0,
                category: loaiXe?.ten_loai || p.id_loai_xe?.toString() || '',
                imageUrl: bienThe?.hinh || p.hinh || '',
                description: p.mo_ta || p.description || '',
              };
            };
            const allMapped = allRes.data.map(mapProduct);
            setProducts(allMapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allMapped));
          } else {
            setProducts((prev) => [mapped, ...prev]);
          }
        }
      } catch (err: any) {
        console.error('❌ API save failed:', err);
        console.error('❌ Error response:', err?.response);
        console.error('❌ Error data:', err?.response?.data);
        console.error('❌ Error status:', err?.response?.status);
        console.error('❌ Error code:', err?.code);
        console.error('❌ Full error:', JSON.stringify(err?.response?.data, null, 2));

        let errorMsg = 'Lỗi không xác định';
        let errorDetails = '';

        if (err?.response?.data) {
          const errorData = err.response.data;

          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }

          // Thêm chi tiết lỗi nếu có
          if (errorData.original) {
            errorDetails += `\n\nLỗi database: ${errorData.original}`;
          }
          if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
            const validationMsgs = errorData.validationErrors.map((e: any) => e.message).join(', ');
            errorDetails += `\n\nLỗi validation: ${validationMsgs}`;
          }
          if (errorData.details) {
            errorDetails += `\n\nChi tiết: ${errorData.details}`;
          }
        } else if (err?.message) {
          errorMsg = err.message;
        }

        // Hiển thị lỗi chi tiết
        const fullErrorMsg = errorDetails
          ? `${errorMsg}${errorDetails}`
          : errorMsg;

        alert(`Lỗi khi lưu sản phẩm:\n\n${fullErrorMsg}`);

        // fallback to localStorage behavior
        if (product.id) {
          setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
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
    if (!confirm('Xóa sản phẩm này? Hành động không thể hoàn tác.')) return;
    (async () => {
      try {
        await api.delete(`/admin/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.warn('API delete failed, using local fallback', err);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    })();
  }

  const filtered = products
    .filter((p) =>
      (p.name || p.ten_san_pham || "")

        .toLowerCase()
        .includes(query.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      let va: number | string = a[sortBy];
      let vb: number | string = b[sortBy];
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb, 'vi');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const na = Number(va) || 0;
      const nb = Number(vb) || 0;
      return sortDir === 'asc' ? na - nb : nb - na;
    });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
    // Xóa tuần tự; nếu API fail vẫn xóa local
    (async () => {
      try {
        for (const id of selectedIds) {
          try {
            await api.delete(`/admin/products/${id}`);
          } catch { }
        }
      } finally {
        setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        clearSelection();
      }
    })();
  }

  function exportCSV() {
    const header = ['id', 'name', 'price', 'stock', 'category', 'imageUrl', 'description'];
    const rows = filtered.map((p) => header.map((h) => {
      const val = (p as any)[h] ?? '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}` + `"`;
    }).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading) {
    return <div className={styles.container}><main className={styles.main}>Đang kiểm tra quyền truy cập...</main></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-lg">
        {/* LOGO ADMIN */}
        <div className="flex items-center justify-center h-24 border-b border-blue-600">
          <img
            src="/images/logobn.png"   // ← file logo của bạn trong public/images/
            alt="Admin Logo"
            className="w-41 h-auto object-contain shadow-lg rounded-lg"  // bo vừa đẹp
          />
        </div>

        <h2 className="text-2xl font-bold px-6 py-4">
          Admin Panel
        </h2>


        <nav>
          <ul className="space-y-2 px-4 py-4">

            {([
              'Home',
              'Products',
              'Orders',
              'Users',
              'News',
              'Settings',
            ] as const).map((t) => (
              <li className="" key={t}>
                <button
                  onClick={() => setTab(t)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition
      ${tab === t
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'text-blue-50 hover:bg-blue-600 hover:text-white'}
    `}
                >
                  {t}
                </button>
              </li>

            ))}
          </ul>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 bg-white shadow p-6 rounded-xl border border-gray-200">

          <div>
            <h1 className="text-3xl font-bold text-red-600">{tab === 'Products' ? 'Quản lý sản phẩm' : (tab === 'Home' ? 'Tổng quan' : tab)}</h1>
            <p className="text-gray-500">Bảng điều khiển quản trị viên — các thao tác được lưu cục bộ (localStorage).</p>
          </div>
          <div className={styles.headerActions}>
            {tab === 'Products' && (
              <>
                <input placeholder="Tìm sản phẩm hoặc danh mục..." value={query} onChange={(e) => setQuery(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300" />
                <select aria-label="sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300">
                  <option value="name">Sắp xếp: Tên</option>
                  <option value="price">Sắp xếp: Giá</option>
                  <option value="stock">Sắp xếp: Tồn kho</option>
                </select>
                <select aria-label="sort direction" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className={styles.searchInput}>
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
                {selectedIds.size > 0 && (
                  <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow">Xóa {selectedIds.size} mục</button>
                )}
                <button onClick={exportCSV} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 shadow">Xuất CSV</button>
                <button onClick={handleAddClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">Thêm sản phẩm</button>
              </>
            )}
          </div>
        </header>



        {/* HOME */}
        {tab === 'Home' && (
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className={styles.toolbar}>
              <button className={`${styles.pillBtn} ${rangePreset === '7d' ? styles.pillActive : ''}`} onClick={() => {
                setRangePreset('7d');
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6);
                setStartDate(start.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}>7 ngày</button>
              <button className={`${styles.pillBtn} ${rangePreset === '15d' ? styles.pillActive : ''}`} onClick={() => {
                setRangePreset('15d');
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 29);
                setStartDate(start.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}>15 ngày</button>
              <button className={`${styles.pillBtn} ${rangePreset === 'this-month' ? styles.pillActive : ''}`} onClick={() => {
                setRangePreset('this-month');
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setStartDate(start.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}>Tháng này</button>
              <span className={styles.subdued}>Chọn Ngày Tháng</span>
              <input aria-label="start date" type="date" className={styles.dateInput} value={startDate} onChange={(e) => { setStartDate(e.target.value); setRangePreset('custom'); }} />
            </div>
            <DashboardStats
              stats={undefined}
              fallbackOrders={orders.filter((o) => {
                if (!startDate || !endDate) return true;
                const d = new Date(o.createdAt).toISOString().slice(0, 10);
                return d >= startDate && d <= endDate;
              })}
              fallbackProducts={products}
            />
          </section>
        )}


        {/* PRODUCTS */}
        {tab === 'Products' && (
          <section>
            {loadingProducts ? (
              <div>Đang tải sản phẩm...</div>
            ) : loadError ? (
              <div className={styles.errorText}>
                <div style={{ marginBottom: '12px' }}>{loadError}</div>
                {loadError.includes('Không thể kết nối') && (
                  <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', fontSize: '14px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>📋 Hướng dẫn khởi động server:</strong>
                    <ol style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: '1.8' }}>
                      <li>Mở terminal/command prompt</li>
                      <li>Chuyển đến thư mục: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>sever_node</code></li>
                      <li>Chạy lệnh: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>node index.js</code> hoặc <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>npm start</code></li>
                      <li>Đảm bảo server chạy trên <strong>port 3000</strong></li>
                      <li>Refresh trang này sau khi server đã khởi động</li>
                    </ol>
                  </div>
                )}
              </div>
            ) : filtered.length === 0 && products.length === 0 ? (
              <div className={styles.emptyMsg}>
                <p>Không có sản phẩm nào.</p>
                <p className={styles.emptySubtext}>
                  {loadingProducts ? 'Đang tải...' : 'Vui lòng thêm sản phẩm mới.'}
                </p>
              </div>
            ) : filtered.length === 0 && products.length > 0 ? (
              <div className={styles.emptyMsg}>
                <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</p>
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
        {tab === 'Orders' && (
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
                onChange={(e) => setOrderFilter(e.target.value as any)}
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
                  const matchStatus = orderFilter === 'all' || o.status === orderFilter;
                  const q = orderQuery.toLowerCase();
                  const matchText =
                    String(o.id).toLowerCase().includes(q) ||
                    (o.ten_nguoi_nhan || '').toLowerCase().includes(q) ||
                    (o.dien_thoai || '').toLowerCase().includes(q);
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
                      ten_nguoi_nhan: raw.ten_nguoi_nhan ?? o.ten_nguoi_nhan,
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
                      customerEmail: raw.email ?? o.customerEmail ?? null,
                      so_luong: Number(raw.so_luong ?? o.so_luong),
                    };

                    setOrders((prev) =>
                      prev.map((x) => (x.id === o.id ? updated : x))
                    );
                    // optional: localStorage.setItem('admin_orders_v1', JSON.stringify(newOrders));
                  } catch (err) {
                    console.error('Update status failed, fallback local:', err);
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
        {tab === 'Users' && (
          <section>
            <div className={styles.headerActions}>
              <input placeholder="Tìm tên hoặc email..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} className={styles.searchInput} />
            </div>
            {usersLoading ? (
              <div>Đang tải người dùng...</div>
            ) : (
              <UsersList
                users={users.filter(u =>
                  (u.ho_ten || '').toLowerCase().includes(userQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(userQuery.toLowerCase())
                )}
                onChangeRole={async (u, role) => {
                  try {
                    const res = await api.put(`/admin/users/${u.id}/role`, { vai_tro: role }, { withCredentials: true });
                    const updated = res.data || { ...u, vai_tro: role };
                    setUsers((prev) => {
                      const newUsers = prev.map(x => x.id === u.id ? updated : x);
                      localStorage.setItem('admin_users_v1', JSON.stringify(newUsers));
                      return newUsers;
                    });
                  } catch {
                    setUsers((prev) => {
                      const newUsers = prev.map(x => x.id === u.id ? { ...x, vai_tro: role } : x);
                      localStorage.setItem('admin_users_v1', JSON.stringify(newUsers));
                      return newUsers;
                    });
                  }
                }}
                onToggleActive={async (u) => {
                  const nextStatus = u.trang_thai === 'active' ? 'locked' : 'active';
                  try {
                    const res = await api.put(`/admin/users/${u.id}/status`, { trang_thai: nextStatus }, { withCredentials: true });
                    const updated = res.data || { ...u, trang_thai: nextStatus };
                    setUsers((prev) => {
                      const newUsers = prev.map(x => x.id === u.id ? updated : x);
                      localStorage.setItem('admin_users_v1', JSON.stringify(newUsers));
                      return newUsers;
                    });
                  } catch {
                    setUsers((prev) => {
                      const newUsers = prev.map(x => x.id === u.id ? { ...x, trang_thai: nextStatus } : x);
                      localStorage.setItem('admin_users_v1', JSON.stringify(newUsers));
                      return newUsers;
                    });
                  }
                }}
              />
            )}
          </section>
        )}
        {/* NEWS */}
        {tab === 'News' && (
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
                  n.tieu_de.toLowerCase().includes(newsQuery.toLowerCase())
                )}
                onDelete={async (id) => {
                  await api.delete(`/api/tin_tuc/${id}`);
                  setNews((prev) => prev.filter((x) => x.id !== id));
                }}
                onUpdate={async (item) => {
                  await api.put(`/api/tin_tuc/${item.id}`, item);
                  setNews((prev) =>
                    prev.map((x) => (x.id === item.id ? item : x))
                  );
                }}
              />
            )}
          </section>
        )}
        {/* SETTINGS */}
        {tab === 'Settings' && (
          <section>
            {settingsLoading ? (
              <div>Đang tải cài đặt...</div>
            ) : (
              <SettingsForm
                initial={settings ?? undefined}
                onSave={async (data) => {
                  try {
                    const res = await api.put('/admin/settings', data, { withCredentials: true });
                    const saved = res?.data || data;
                    setSettings(saved);
                    localStorage.setItem('admin_settings_v1', JSON.stringify(saved));
                    alert('Đã lưu cài đặt');
                  } catch {
                    setSettings(data);
                    localStorage.setItem('admin_settings_v1', JSON.stringify(data));
                    alert('Lưu cục bộ (fallback), API chưa khả dụng');
                  }
                }}
              />
            )}
          </section>
        )}

        {showForm && (
          <ProductForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        )}
        {viewingOrder && (
          <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">

            <div className="bg-white p-8 rounded-xl shadow-xl w-[480px] border border-gray-200">

              <h3 className={styles.headerTitle}>Chi tiết đơn #{viewingOrder.id}</h3>

              <p>
                Khách: {viewingOrder.ten_nguoi_nhan}
                {viewingOrder.customerEmail ? ` — ${viewingOrder.customerEmail}` : ''}
              </p>

              <p>
                Trạng thái:{' '}
                {viewingOrder.status === 'pending'
                  ? 'Chờ xử lý'
                  : viewingOrder.status === 'paid'
                    ? 'Đã thanh toán'
                    : viewingOrder.status === 'shipping'
                      ? 'Đang giao'
                      : viewingOrder.status === 'done'
                        ? 'Hoàn tất'
                        : 'Đã hủy'}
              </p>

              {/* 👇 THÊM DÒNG NÀY */}
              <p>Số lượng: {viewingOrder.so_luong}</p>
              <p>Tổng tiền: {viewingOrder.total.toLocaleString('vi-VN')} đ</p>
              <p>Ngày đặt: {new Date(viewingOrder.ngay_dat).toLocaleString('vi-VN')}</p>
              <div className={styles.formActions}>
                <button className={styles.btn} onClick={() => setViewingOrder(null)}>
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


/*Thứ tự hook khai báo phải đúng thứ tự JSX gọi tab.
Nếu báo Users trước News → JSX cũng phải render Users trước News.

Nếu JSX render News trước Users → React cho rằng hook thứ X bị lệch, → crash.*/