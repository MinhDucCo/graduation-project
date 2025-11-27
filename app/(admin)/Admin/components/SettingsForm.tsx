"use client";

import React, { useEffect, useState } from 'react';
import styles from '../admin.module.css';

export interface SettingsData {
  shopName: string;
  shopEmail: string;
  shopPhone: string;
  shopAddress: string;
  shippingFee: number;
  codEnabled: boolean;
  vnpayEnabled: boolean;
}

interface Props {
  initial?: SettingsData;
  onSave: (data: SettingsData) => void;
}

export default function SettingsForm({ initial, onSave }: Props) {
  const [shopName, setShopName] = useState(initial?.shopName || '');
  const [shopEmail, setShopEmail] = useState(initial?.shopEmail || '');
  const [shopPhone, setShopPhone] = useState(initial?.shopPhone || '');
  const [shopAddress, setShopAddress] = useState(initial?.shopAddress || '');
  const [shippingFee, setShippingFee] = useState<number>(initial?.shippingFee ?? 0);
  const [codEnabled, setCodEnabled] = useState<boolean>(initial?.codEnabled ?? true);
  const [vnpayEnabled, setVnpayEnabled] = useState<boolean>(initial?.vnpayEnabled ?? false);

  useEffect(() => {
    setShopName(initial?.shopName || '');
    setShopEmail(initial?.shopEmail || '');
    setShopPhone(initial?.shopPhone || '');
    setShopAddress(initial?.shopAddress || '');
    setShippingFee(initial?.shippingFee ?? 0);
    setCodEnabled(initial?.codEnabled ?? true);
    setVnpayEnabled(initial?.vnpayEnabled ?? false);
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ shopName, shopEmail, shopPhone, shopAddress, shippingFee: Number(shippingFee)||0, codEnabled, vnpayEnabled });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div>
          <label className={styles.formLabel} htmlFor="shopName">Tên cửa hàng</label>
          <input id="shopName" placeholder="GearX" className={styles.inputField} value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </div>
        <div>
          <label className={styles.formLabel} htmlFor="shopEmail">Email</label>
          <input id="shopEmail" type="email" placeholder="support@example.com" className={styles.inputField} value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} />
        </div>
        <div>
          <label className={styles.formLabel} htmlFor="shopPhone">Số điện thoại</label>
          <input id="shopPhone" placeholder="0123456789" className={styles.inputField} value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} />
        </div>
        <div>
          <label className={styles.formLabel} htmlFor="shopAddress">Địa chỉ</label>
          <input id="shopAddress" placeholder="Hà Nội" className={styles.inputField} value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} />
        </div>
        <div>
          <label className={styles.formLabel} htmlFor="shippingFee">Phí vận chuyển mặc định (VND)</label>
          <input id="shippingFee" type="number" placeholder="30000" className={styles.inputField} value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} />
        </div>
        <div>
          <label className={styles.formLabel}>COD</label>
          <select aria-label="cod-enabled" className={styles.inputField} value={codEnabled ? '1' : '0'} onChange={(e) => setCodEnabled(e.target.value==='1')}>
            <option value="1">Bật</option>
            <option value="0">Tắt</option>
          </select>
        </div>
        <div>
          <label className={styles.formLabel}>VNPay (placeholder)</label>
          <select aria-label="vnpay-enabled" className={styles.inputField} value={vnpayEnabled ? '1' : '0'} onChange={(e) => setVnpayEnabled(e.target.value==='1')}>
            <option value="1">Bật</option>
            <option value="0">Tắt</option>
          </select>
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>Lưu cài đặt</button>
      </div>
    </form>
  );
}