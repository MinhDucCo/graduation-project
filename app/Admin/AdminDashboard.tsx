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
import styles from './admin.module.css';
import { api } from "@/utils/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'done' | 'cancelled';

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

const STORAGE_KEY = 'admin_products_v1';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<'Home' | 'Products' | 'Orders' | 'Users' | 'Settings'>('Home');
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
  const [rangePreset, setRangePreset] = useState<'7d' | '30d' | 'this-month' | 'custom'>('7d');

  // Auth guard: allow only admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/auth/me', { withCredentials: true });
        const role = res?.data?.user?.vai_tro;
        const isAdmin = role === 'admin' || role === 'ADMIN' || role === 1;
        if (!isAdmin) {
          router.replace('/Login');
          return;
        }
      } catch (e) {
        router.replace('/Login');
        return;
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    // Try loading from API first; fallback to localStorage
    let mounted = true;
    (async () => {
      setLoadingProducts(true);
      setLoadError(null);
      try {
        const res = await api.get('/admin/products');
        if (mounted && Array.isArray(res.data)) {
          // map API shape to local Product shape if needed
          const mapped = res.data.map((p: any) => ({
            id: p.ma_san_pham || p.id || uid(),
            name: p.ten_san_pham || p.name || 'Untitled',
            price: p.bien_the_san_phams && p.bien_the_san_phams[0] ? Number(p.bien_the_san_phams[0].gia) : 0,
            stock: p.bien_the_san_phams && p.bien_the_san_phams[0] ? Number(p.bien_the_san_phams[0].so_luong) : 0,
            category: p.LoaiXeModel?.ten_loai || p.id_loai_xe?.toString() || '',
            imageUrl: p.bien_the_san_phams && p.bien_the_san_phams[0] ? p.bien_the_san_phams[0].hinh : '',
            description: p.mo_ta || '',
          }));
          setProducts(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        // ignore and fallback to localStorage
        console.warn('API load failed, falling back to localStorage', err);
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setProducts(JSON.parse(raw));
        } else {
          // seed with a few example products
          const seed: Product[] = [
            { id: uid(), name: 'Bugi cao cấp', price: 120000, stock: 40, category: 'Động cơ', imageUrl: '', description: 'Bugi cho xe máy, hiệu suất cao' },
            { id: uid(), name: 'Lọc gió', price: 80000, stock: 25, category: 'Lọc', imageUrl: '', description: 'Lọc gió chính hãng' },
            { id: uid(), name: 'Nhông xích', price: 150000, stock: 15, category: 'Truyền động', imageUrl: '', description: 'Nhông xích bền bỉ' },
          ];
          setProducts(seed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        }
      } catch (e) {
        console.error('Failed to load products', e);
        setLoadError('Không thể tải danh sách sản phẩm.');
      }
      finally {
        setLoadingProducts(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load orders (API, fallback localStorage)
  useEffect(() => {
    if (tab !== 'Orders' && tab !== 'Home') return;
    let mounted = true;
    (async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get('/admin/orders', { withCredentials: true });
        if (mounted && Array.isArray(res.data)) {
          setOrders(res.data);
          localStorage.setItem('admin_orders_v1', JSON.stringify(res.data));
          return;
        }
      } catch (e) {
        // fallback to local
        const raw = localStorage.getItem('admin_orders_v1');
        if (raw) {
          setOrders(JSON.parse(raw));
        } else {
          const seed: Order[] = [
            { id: uid(), code: 'ODR001', customerName: 'Nguyễn Văn A', total: 250000, status: 'pending', createdAt: new Date().toISOString(), items: [] },
            { id: uid(), code: 'ODR002', customerName: 'Trần Thị B', total: 480000, status: 'paid', createdAt: new Date().toISOString(), items: [] },
          ];
          setOrders(seed);
          localStorage.setItem('admin_orders_v1', JSON.stringify(seed));
        }
      } finally {
        setOrdersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [tab]);

  // Load users (API, fallback localStorage)
  useEffect(() => {
    if (tab !== 'Users') return;
    let mounted = true;
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
        const raw = localStorage.getItem('admin_users_v1');
        if (raw) {
          setUsers(JSON.parse(raw));
        } else {
          const seed = [
            { id: 'u1', ho_ten: 'Admin', email: 'admin@example.com', vai_tro: 1, trang_thai: 'active' },
            { id: 'u2', ho_ten: 'User A', email: 'usera@example.com', vai_tro: 0, trang_thai: 'active' },
          ];
          setUsers(seed);
          localStorage.setItem('admin_users_v1', JSON.stringify(seed));
        }
      } finally {
        setUsersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [tab]);

  // Load settings (API, fallback local)
  useEffect(() => {
    if (tab !== 'Settings') return;
    let mounted = true;
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
        const raw = localStorage.getItem('admin_settings_v1');
        if (raw) {
          setSettings(JSON.parse(raw));
        } else {
          const seed: SettingsData = {
            shopName: 'GearX', shopEmail: 'support@example.com', shopPhone: '0123456789', shopAddress: 'Hà Nội', shippingFee: 30000, codEnabled: true, vnpayEnabled: false,
          };
          setSettings(seed);
          localStorage.setItem('admin_settings_v1', JSON.stringify(seed));
        }
      } finally {
        setSettingsLoading(false);
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

  function handleSave(product: Product) {
    (async () => {
      try {
        if (product.id) {
          // update
          await api.put(`/admin/products/${product.id}`, {
            ten_san_pham: product.name,
            mo_ta: product.description,
            // minimal mapping; more fields can be added
          }, { withCredentials: true });
          setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
        } else {
          // create
          const res = await api.post('/admin/products', {
            ten_san_pham: product.name,
            mo_ta: product.description,
            bien_the: [{ mau_sac: '', gia: product.price, so_luong: product.stock, hinh: product.imageUrl }],
          }, { withCredentials: true });
          const created = res.data;
          const mapped = {
            id: created.ma_san_pham || uid(),
            name: created.ten_san_pham || product.name,
            price: created.bien_the_san_phams && created.bien_the_san_phams[0] ? Number(created.bien_the_san_phams[0].gia) : product.price,
            stock: created.bien_the_san_phams && created.bien_the_san_phams[0] ? Number(created.bien_the_san_phams[0].so_luong) : product.stock,
            category: '',
            imageUrl: created.bien_the_san_phams && created.bien_the_san_phams[0] ? created.bien_the_san_phams[0].hinh : product.imageUrl,
            description: created.mo_ta || product.description,
          };
          setProducts((prev) => [mapped, ...prev]);
        }
      } catch (err) {
        console.warn('API save failed, using local fallback', err);
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
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || (p.category || '').toLowerCase().includes(query.toLowerCase()))
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
          } catch {}
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
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarHeader}>Admin</h2>
        <nav>
          <ul className={styles.navList}>
            {([
              'Home',
              'Products',
              'Orders',
              'Users',
              'Settings',
            ] as const).map((t) => (
              <li key={t} className={styles.navItem}>
                <button
                  onClick={() => setTab(t)}
                  className={tab === t ? `${styles.navButton} ${styles.active}` : styles.navButton}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>{tab === 'Products' ? 'Quản lý sản phẩm' : (tab === 'Home' ? 'Tổng quan' : tab)}</h1>
            <p className={styles.headerSubtitle}>Bảng điều khiển quản trị viên — các thao tác được lưu cục bộ (localStorage).</p>
          </div>
          <div className={styles.headerActions}>
            {tab === 'Products' && (
              <>
                <input placeholder="Tìm sản phẩm hoặc danh mục..." value={query} onChange={(e) => setQuery(e.target.value)} className={styles.searchInput} />
                <select aria-label="sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={styles.searchInput}>
                  <option value="name">Sắp xếp: Tên</option>
                  <option value="price">Sắp xếp: Giá</option>
                  <option value="stock">Sắp xếp: Tồn kho</option>
                </select>
                <select aria-label="sort direction" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className={styles.searchInput}>
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
                {selectedIds.size > 0 && (
                  <button onClick={handleBulkDelete} className={styles.deleteBtn}>Xóa {selectedIds.size} mục</button>
                )}
                <button onClick={exportCSV} className={styles.actionBtn}>Xuất CSV</button>
                <button onClick={handleAddClick} className={styles.primaryButton}>Thêm sản phẩm</button>
              </>
            )}
          </div>
        </header>

        {tab === 'Home' && (
          <section>
            <div className={styles.toolbar}>
              <button className={`${styles.pillBtn} ${rangePreset==='7d'?styles.pillActive:''}`} onClick={() => {
                setRangePreset('7d');
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate()-6);
                setStartDate(start.toISOString().slice(0,10));
                setEndDate(end.toISOString().slice(0,10));
              }}>7 ngày</button>
              <button className={`${styles.pillBtn} ${rangePreset==='30d'?styles.pillActive:''}`} onClick={() => {
                setRangePreset('30d');
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate()-29);
                setStartDate(start.toISOString().slice(0,10));
                setEndDate(end.toISOString().slice(0,10));
              }}>30 ngày</button>
              <button className={`${styles.pillBtn} ${rangePreset==='this-month'?styles.pillActive:''}`} onClick={() => {
                setRangePreset('this-month');
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
                setStartDate(start.toISOString().slice(0,10));
                setEndDate(end.toISOString().slice(0,10));
              }}>Tháng này</button>
              <span className={styles.subdued}>hoặc chọn khoảng:</span>
              <input aria-label="start date" type="date" className={styles.dateInput} value={startDate} onChange={(e)=>{setStartDate(e.target.value);setRangePreset('custom');}} />
              <span>—</span>
              <input aria-label="end date" type="date" className={styles.dateInput} value={endDate} onChange={(e)=>{setEndDate(e.target.value);setRangePreset('custom');}} />
            </div>
            <DashboardStats
              stats={undefined}
              fallbackOrders={orders.filter(o => {
                if (!startDate || !endDate) return true;
                const d = new Date(o.createdAt).toISOString().slice(0,10);
                return d >= startDate && d <= endDate;
              })}
              fallbackProducts={products}
            />
          </section>
        )}

        {tab === 'Products' && (
          <section>
            {loadingProducts ? (
              <div>Đang tải sản phẩm...</div>
            ) : loadError ? (
              <div className={styles.errorText}>{loadError}</div>
            ) : (
              <ProductList
                products={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAllCurrent}
                onClearSelection={clearSelection}
              />
            )}
          </section>
        )}

        {tab === 'Orders' && <div>Danh sách đơn hàng (tương lai) — tích hợp API, lọc, trạng thái.</div>}
        {tab === 'Orders' && (
          <section>
            <div className={styles.headerActions}>
              <input placeholder="Tìm mã đơn hoặc tên khách..." value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} className={styles.searchInput} />
              <select aria-label="filter orders" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value as any)} className={styles.searchInput}>
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
                orders={orders.filter(o => (orderFilter==='all'||o.status===orderFilter) && (
                  o.code.toLowerCase().includes(orderQuery.toLowerCase()) || o.customerName.toLowerCase().includes(orderQuery.toLowerCase())
                ))}
                onView={(o) => setViewingOrder(o)}
                onChangeStatus={async (o, status) => {
                  try {
                    const res = await api.put(`/admin/orders/${o.id}/status`, { status });
                    const updated = res.data || { ...o, status };
                    setOrders(prev => prev.map(x => x.id===o.id ? updated : x));
                    localStorage.setItem('admin_orders_v1', JSON.stringify(prev => prev));
                  } catch {
                    setOrders(prev => prev.map(x => x.id===o.id ? { ...x, status } : x));
                    localStorage.setItem('admin_orders_v1', JSON.stringify(orders.map(x => x.id===o.id ? { ...x, status } : x)));
                  }
                }}
              />
            )}
          </section>
        )}
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
                  (u.ho_ten||'').toLowerCase().includes(userQuery.toLowerCase()) || (u.email||'').toLowerCase().includes(userQuery.toLowerCase())
                )}
                onChangeRole={async (u, role) => {
                  try {
                    const res = await api.put(`/admin/users/${u.id}/role`, { vai_tro: role }, { withCredentials: true });
                    const updated = res.data || { ...u, vai_tro: role };
                    setUsers(prev => prev.map(x => x.id===u.id ? updated : x));
                    localStorage.setItem('admin_users_v1', JSON.stringify(prev => prev));
                  } catch {
                    setUsers(prev => prev.map(x => x.id===u.id ? { ...x, vai_tro: role } : x));
                    localStorage.setItem('admin_users_v1', JSON.stringify(users.map(x => x.id===u.id ? { ...x, vai_tro: role } : x)));
                  }
                }}
                onToggleActive={async (u) => {
                  const nextStatus = u.trang_thai === 'active' ? 'locked' : 'active';
                  try {
                    const res = await api.put(`/admin/users/${u.id}/status`, { trang_thai: nextStatus }, { withCredentials: true });
                    const updated = res.data || { ...u, trang_thai: nextStatus };
                    setUsers(prev => prev.map(x => x.id===u.id ? updated : x));
                    localStorage.setItem('admin_users_v1', JSON.stringify(prev => prev));
                  } catch {
                    setUsers(prev => prev.map(x => x.id===u.id ? { ...x, trang_thai: nextStatus } : x));
                    localStorage.setItem('admin_users_v1', JSON.stringify(users.map(x => x.id===u.id ? { ...x, trang_thai: nextStatus } : x)));
                  }
                }}
              />
            )}
          </section>
        )}
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.headerTitle}>Chi tiết đơn {viewingOrder.code}</h3>
            <p>Khách: {viewingOrder.customerName}{viewingOrder.customerEmail?` — ${viewingOrder.customerEmail}`:''}</p>
            <p>Trạng thái: {(
              viewingOrder.status === 'pending' ? 'Chờ xử lý' :
              viewingOrder.status === 'paid' ? 'Đã thanh toán' :
              viewingOrder.status === 'shipping' ? 'Đang giao' :
              viewingOrder.status === 'done' ? 'Hoàn tất' : 'Đã hủy'
            )}</p>
            <p>Tổng tiền: {viewingOrder.total.toLocaleString('vi-VN')} đ</p>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setViewingOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}