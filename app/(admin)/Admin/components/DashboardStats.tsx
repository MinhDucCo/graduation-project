"use client";

import React from "react";
import type { Order, Product } from "../AdminDashboard";
import styles from "../admin.module.css";

interface Props {
  stats?: {
    totalRevenue?: number;
    totalOrders?: number;
    totalCustomers?: number;
  } | null;
  fallbackOrders?: Order[];
  fallbackProducts?: Product[];
}

export default function DashboardStats({
  stats,
  fallbackOrders,
  fallbackProducts,
}: Props) {
  const orders: Order[] = Array.isArray(fallbackOrders) ? fallbackOrders : [];
  const products: Product[] = Array.isArray(fallbackProducts)
    ? fallbackProducts
    : [];

  // Chỉ tính doanh thu cho đơn đã thanh toán / hoàn tất
  const paidOrders = orders.filter(
    (o) => ["paid", "done", "Hoàn tất", "Đã thanh toán"].includes(o.status)
  );

  // Tổng số đơn đã bán
  const totalOrders = stats?.totalOrders ?? paidOrders.length;

  // Tổng doanh thu
  const totalRevenue =
    stats?.totalRevenue ??
    paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Tổng số sản phẩm bán được
// Tổng số sản phẩm bán được
const totalProducts = orders.reduce((sum, o) => {
  // chỉ tính đơn hoàn tất hoặc đã thanh toán
  if (o.status === "done" || o.status === "paid") {
    return sum + Number(o.so_luong ?? 0);
  }
  return sum;
}, 0);



  // ----- TẠO DỮ LIỆU CHO BIỂU ĐỒ DOANH THU -----
  // Gom doanh thu theo ngày (YYYY-MM-DD)
  const revenueByDateMap = new Map<string, number>();

  paidOrders.forEach((o) => {
    const raw = o.ngay_dat || o.createdAt;
const d = new Date(raw.includes(" ") ? raw.replace(" ", "T") : raw);

    if (Number.isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd

    const prev = revenueByDateMap.get(key) || 0;
    revenueByDateMap.set(key, prev + Number(o.total || 0));
    
  });

  const revenueData = Array.from(revenueByDateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
  const maxValue =
    revenueData.reduce((max, item) => (item.value > max ? item.value : max), 0) ||
    1; // tránh chia cho 0
  console.log("Revenue raw orders:", orders);
console.log("Paid orders:", paidOrders);
console.log("Revenue data:", revenueData);

  return (
    <div>
      {/* 3 ô thống kê trên cùng */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng đơn đã bán</div>
          <div className={styles.statValue}>{totalOrders}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Doanh thu (đã bán)</div>
          <div className={styles.statValue}>
            {totalRevenue.toLocaleString("vi-VN")} đ
          </div>
        </div>

        <div className={styles.statCard}>
  <div className={styles.statLabel}>Số sản phẩm</div>
  <div className={styles.statValue}>{totalProducts}</div>
</div>

      </div>

      {/* BIỂU ĐỒ DOANH THU */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Biểu đồ doanh thu theo ngày</h3>
          <span className={styles.chartSubtitle}>
            Chỉ tính đơn &quot;Đã thanh toán&quot; / &quot;Hoàn tất&quot;
          </span>
        </div>

        {revenueData.length === 0 ? (
          <div className={styles.emptyMsg}>Không có dữ liệu doanh thu.</div>
        ) : (
          <div className={styles.chartWrapper}>

            {revenueData.map((item) => {
  const heightPercent = (item.value / maxValue) * 100;



               return (
    <div key={item.date} className={styles.chartBarCol}>
      
      <div className={styles.chartBarContainer}>
        <div
          className={styles.chartBar}
          style={{ height: `${heightPercent}%` }}
        />
      </div>
      <div className={styles.chartBarLabel}>
        {/* 👇 HIỂN THỊ GIÁ – THÊM DÒNG NÀY */}
      <div className={styles.chartValue}>
        {item.value.toLocaleString("vi-VN")}
      </div>
        {new Date(item.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })}
      </div>
    </div>
  );
})}
          </div>
        )}
      </div>
    </div>
  );
}
