"use client";

import React, { useMemo } from 'react';
import styles from '../admin.module.css';
import type { Order, Product } from '../AdminDashboard';

interface Props {
  stats?: {
    revenueTotal: number;
    ordersTotal: number;
    ordersByStatus: Record<string, number>;
    topProducts: { id: string; name: string; count: number; revenue: number }[];
    salesByDate: { date: string; total: number }[];
  };
  fallbackOrders?: Order[];
  fallbackProducts?: Product[];
}

function computeFallback(orders: Order[] = [], products: Product[] = []) {
  const ordersTotal = orders.length;
  const ordersByStatus: Record<string, number> = {};
  let revenueTotal = 0;
  const productAgg = new Map<string, { id: string; name: string; count: number; revenue: number }>();
  const salesByDateMap = new Map<string, number>();

  for (const o of orders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    revenueTotal += Number(o.total) || 0;
    const dateKey = new Date(o.createdAt).toISOString().slice(0, 10);
    salesByDateMap.set(dateKey, (salesByDateMap.get(dateKey) || 0) + (Number(o.total) || 0));
    for (const it of (o.items || [])) {
      const key = it.productId || it.name;
      const prev = productAgg.get(key) || { id: key, name: it.name, count: 0, revenue: 0 };
      prev.count += Number(it.quantity) || 0;
      prev.revenue += (Number(it.quantity) || 0) * (Number(it.price) || 0);
      productAgg.set(key, prev);
    }
  }

  const salesByDate = Array.from(salesByDateMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { revenueTotal, ordersTotal, ordersByStatus, topProducts, salesByDate };
}

export default function DashboardStats({ stats, fallbackOrders, fallbackProducts }: Props) {
  const data = useMemo(() => {
    if (stats) return stats;
    return computeFallback(fallbackOrders, fallbackProducts);
  }, [stats, fallbackOrders, fallbackProducts]);

  return (
    <div className={styles.cardGrid}>
      <div className={styles.card}>
        <div className={styles.kpiTitle}>Tổng doanh thu</div>
        <div className={styles.kpiValue}>{(data.revenueTotal || 0).toLocaleString('vi-VN')} đ</div>
      </div>
      <div className={styles.card}>
        <div className={styles.kpiTitle}>Tổng đơn</div>
        <div className={styles.kpiValue}>{data.ordersTotal || 0}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.kpiTitle}>Theo trạng thái</div>
        <div className={styles.kpiList}>
          {Object.entries(data.ordersByStatus || {}).map(([k, v]) => (
            <div key={k} className={styles.kpiItem}>{k}: {v}</div>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.kpiTitle}>Top sản phẩm</div>
        <div className={styles.kpiList}>
          {(data.topProducts || []).map(p => (
            <div key={p.id} className={styles.kpiItem}>
              {p.name}: {p.count} ({p.revenue.toLocaleString('vi-VN')} đ)
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.card} ${styles.chartFull}`}>
        <div className={styles.kpiTitle}>Doanh thu theo ngày</div>
        <div className={styles.chartRow}>
          {(data.salesByDate || []).map(point => {
            const h = Math.min(100, Math.max(4, point.total ? Math.log10(point.total + 10) * 20 : 4));
            return (
              <div key={point.date} className={`${styles.chartBar} ${styles.barDynamic}`} title={`${point.date}: ${point.total.toLocaleString('vi-VN')} đ`} style={{ ['--bar-h' as any]: `${h}%` }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}


