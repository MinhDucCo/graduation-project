'use client';

import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  useEffect(() => {
    document.querySelector('header')?.setAttribute('style', 'display:none !important');
document.querySelector('footer')?.setAttribute('style', 'display:none !important');
    const partners = document.querySelector('.partners-section');
    partners?.setAttribute('style', 'display:none !important');

    return () => {
      partners?.setAttribute('style', 'display:block');
    };
  }, []);


  return <AdminDashboard />;
}
