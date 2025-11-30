// app/(admin)/Admin/types.ts
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'done' | 'cancelled';

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
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  status: OrderStatus | string;
  total: number;
  createdAt?: string;
  ngay_dat_hang?: string;
  so_luong?: number; // nếu backend trả số lượng tổng
  items?: OrderItem[];
}
