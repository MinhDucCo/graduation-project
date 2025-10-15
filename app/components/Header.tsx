'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  // Giỏ hàng
  const [cart, setCart] = useState<any[]>([]);
  const fetchCart = () => {
    fetch("http://localhost:3000/api/cart")
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalQuantity = cart.reduce((sum, item) => sum + (Number(item.so_luong) || 0), 0);

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/tim-kiem?tu_khoa=${encodeURIComponent(searchTerm)}&page=1`);
    }
  };

  return (
    <header className="w-full shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white px-6 py-2">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/images/logo gearX.png" // đường dẫn public
            alt="Phụ Tùng Xe Máy"
            width={150} // chiều rộng cố định
            height={64} // chiều cao cố định
            className="object-contain"
          />
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none"
          />
          <button type="submit" className="absolute right-3 top-2 text-gray-500">
            🔍
          </button>
        </form>

        {/* Hotline & Giỏ hàng */}
        {/* Đăng nhập / Đăng ký */}
        <div className="flex gap-2 items-center">
          <button
            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition"
            onClick={() => router.push("/Login")}
          >
            Đăng nhập
          </button>
          <button
            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition"
            onClick={() => router.push("/register")}
          >
            Đăng ký
          </button>

          {/* Icon giỏ hàng */}
          <div
            className="relative cursor-pointer"
            onClick={() => router.push("/AddToCart")}
          >
            <FaShoppingCart size={28} />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {totalQuantity}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Navbar */}
      <nav className="bg-[#1e73be] text-white">
        <ul className="flex justify-center space-x-8 py-3 font-medium text-sm">
          <li className="hover:underline cursor-pointer"><a href="/">HOME</a></li>
          <li className="hover:underline cursor-pointer"><a href="/gioi-thieu">GIỚI THIỆU</a></li>
          <li className="hover:underline cursor-pointer"><a href="/san-pham">SẢN PHẨM</a></li>
          <li className="hover:underline cursor-pointer"><a href="/khach-hang">KHÁCH HÀNG</a></li>
          <li className="hover:underline cursor-pointer"><a href="/chinh-sach">CHÍNH SÁCH</a></li>
          <li className="hover:underline cursor-pointer"><a href="/tin">TIN TỨC</a></li>
          <li className="hover:underline cursor-pointer"><a href="/lien-he">LIÊN HỆ</a></li>
        </ul>
      </nav>
    </header>
  );
}
