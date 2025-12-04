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
  onClickPending?: () => void; // <<< callback khi click "Cho xac nhan"
}

export default function DashboardStats({
  stats,
  fallbackOrders,
  fallbackProducts,
  onClickPending,
}: Props) {
  const orders: Order[] = Array.isArray(fallbackOrders) ? fallbackOrders : [];
  const products: Product[] = Array.isArray(fallbackProducts)
    ? fallbackProducts
    : [];

  // Chi tinh doanh thu cho don da thanh toan / hoan tat
  const paidOrders = orders.filter((o) =>
    ["paid", "done", "Hoàn tất", "Đã thanh toán"].includes(
      String(o.status ?? "")
    )
  );

  // Tong so don da ban
  const totalOrders = stats?.totalOrders ?? paidOrders.length;

  // Tong doanh thu
  const totalRevenue =
    stats?.totalRevenue ??
    paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Tong so san pham ban duoc
  const totalProducts = orders.reduce((sum, o) => {
    // chi tinh don hoan tat hoac da thanh toan
    const st = String(o.status ?? "").toLowerCase();
    if (st === "done" || st === "paid") {
      return sum + Number(o.so_luong ?? 0);
    }
    return sum;
  }, 0);

  // ----- THONG KE THEO TRANG THAI -----

  // Chuan hoa status tieng Viet / Anh
  const normalizedOrders = orders.map((o) => {
    let st = String(o.status || "").toLowerCase().trim();

    // ho tro luon tieng Viet
    if (st.includes("chờ") || st.includes("cho")) st = "pending";
    if (st.includes("thanh toán") || st.includes("thanh toan")) st = "paid";
    if (st.includes("đang giao") || st.includes("dang giao")) st = "shipping";
    if (st.includes("hoàn tất") || st.includes("hoan tat")) st = "done";
    if (
      st.includes("hủy") ||
      st.includes("huy") ||
      st === "cancelled" ||
      st === "canceled"
    )
      st = "cancelled";

    return { ...o, status: st };
  });

  // Dem theo trang thai
  const countPending = normalizedOrders.filter(
    (o) => o.status === "pending"
  ).length;
  const countPaid = normalizedOrders.filter((o) => o.status === "paid").length;
  const countShipping = normalizedOrders.filter(
    (o) => o.status === "shipping"
  ).length;
  const countDone = normalizedOrders.filter((o) => o.status === "done").length;
  const countCancelled = normalizedOrders.filter(
    (o) => o.status === "cancelled"
  ).length;

  // ----- TAO DU LIEU CHO BIEU DO DOANH THU -----
  const revenueByDateMap = new Map<string, number>();

  paidOrders.forEach((o) => {
    const raw: any = o.ngay_dat || o.createdAt;
    if (!raw) return;

    const d =
      typeof raw === "string" && raw.includes(" ")
        ? new Date(raw.replace(" ", "T"))
        : new Date(raw);

    if (Number.isNaN(d.getTime())) return;

    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
    const prev = revenueByDateMap.get(key) || 0;
    revenueByDateMap.set(key, prev + Number(o.total || 0));
  });

  const revenueData = Array.from(revenueByDateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));

  const maxValue =
    revenueData.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0
    ) || 1; // tranh chia cho 0

  console.log("Revenue raw orders:", orders);
  console.log("Paid orders:", paidOrders);
  console.log("Revenue data:", revenueData);

  return (
    <div>
      <div className={styles.statsGrid}>
        {/* CARD 1 */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Doanh thu (đã bán)</div>
          <div className={styles.statValue}>
            {totalRevenue.toLocaleString("vi-VN")} đ
          </div>
        </div>

        {/* CARD 2 */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng đơn đã bán</div>
          <div className={styles.statValue}>{totalOrders}</div>
        </div>

        {/* CARD 3 */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Số sản phẩm</div>
          <div className={styles.statValue}>{totalProducts}</div>
        </div>

        {/* CARD 4 – TRANG THAI */}
        <div className={styles.statCard}>
          <div className={styles.statusBox}>
            <div className={styles.statusTitle}>Theo trạng thái</div>

            {/* Click vao day de nhay sang Orders + filter cho xu ly */}
            <div
              className={styles.statusItemt}
              onClick={onClickPending}
              style={{ cursor: "pointer" }}
            >
              Chờ xác nhận: {countPending}
            </div>

            <div className={styles.statusItem}>Đã thanh toán: {countPaid}</div>
            <div className={styles.statusItem}>Đang giao: {countShipping}</div>
            <div className={styles.statusItem}>Hoàn tất: {countDone}</div>
            <div className={styles.statusItem}>Đã hủy: {countCancelled}</div>
          </div>
        </div>
      </div>

      {/* Bieu do doanh thu */}
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
