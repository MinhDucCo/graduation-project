'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 🛒 Lấy dữ liệu giỏ hàng
  const fetchCart = () => {
    fetch("http://localhost:3000/api/cart")
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCart();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const totalQuantity = cart.reduce((sum, item) => sum + (Number(item.so_luong) || 0), 0);
  
  // 🔍 Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/tim-kiem?tu_khoa=${encodeURIComponent(searchTerm)}&page=1`);
    }
  };

  // 🚪 Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/Login");
  };

  return (
    <header className="w-full shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white px-6 py-2">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/images/logo gearX.png"
            alt="Phụ Tùng Xe Máy"
            width={190}
            height={130}
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

        {/* User + Giỏ hàng */}
        <div className="flex gap-3 items-center">
          {/* Nếu CHƯA đăng nhập */}
          {!user ? (
            <>
              <button
  className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 ease-in-out"
  onClick={() => router.push("/Login")}
>
  Đăng nhập
</button>

<button
  className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 ease-in-out"
  onClick={() => router.push("/Register")}
>
  Đăng ký
</button>


            </>
          ) : (
            // Nếu ĐÃ đăng nhập
            <div className="flex items-center gap-3">
              <span
                className="font-semibold text-gray-800 cursor-pointer hover:text-red-600 transition"
                onClick={() => router.push(user.vai_tro === 1 ? "/Admin" : "/User")}
              >
                Xin chào, {user.ho_ten || user.name || "Người dùng"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 ease-in-out"
              >
                Đăng xuất
              </button>

            </div>
          )}

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
