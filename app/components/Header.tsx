'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  // Xử lý tìm kiếm khi nhấn Enter hoặc click nút tìm kiếm
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
          <img
            src="/images/logo gearX.png" // Đảm bảo đường dẫn logo đúng
            alt="Phụ Tùng Xe Máy"
            className="h-16 w-auto object-contain"
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
          <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </button>
        </form>

        {/* Hotline & Button */}
        <div className="flex gap-2">
          <a
            href="tel:0909123456"
            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition"
          >
            HOTLINE: 0000 292 000
          </a>
          <button className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition">
            LIÊN HỆ LÀM ĐẠI LÝ
          </button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-[#1e73be] text-white">
        <ul className="flex justify-center space-x-8 py-3 font-medium text-sm">
          <li className="hover:underline cursor-pointer">
            <a href="/">HOME</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/gioi-thieu">GIỚI THIỆU</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/san-pham">SẢN PHẨM</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/khach-hang">KHÁCH HÀNG</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/chinh-sach">CHÍNH SÁCH</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/tuyen-dung">TUYỂN DỤNG</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/tin-tuc">TIN TỨC</a>
          </li>
          <li className="hover:underline cursor-pointer">
            <a href="/lien-he">LIÊN HỆ</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}