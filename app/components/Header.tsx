export default function Header() {
  return (
    <header className="w-full shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white px-6 py-2">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/images/logo1.jpg" // đổi logo của bạn
            alt="Phụ Tùng Xe Máy"
            className="h-10"
          />
        </div>

        {/* Search */}
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none"
          />
          {/* icon search bằng SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-2.5 text-gray-500"
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
        </div>

        {/* Hotline & Button */}
        <div className="flex gap-3">
          <a
            href="tel:0909123456"
            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700"
          >
            HOTLINE: 0909 123 456
          </a>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">
            LIÊN HỆ LÀM ĐẠI LÝ
          </button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-[#1e73be] text-white">
        <ul className="flex justify-center space-x-8 py-3 font-medium text-sm">
          <li className="hover:underline cursor-pointer">HOME</li>
          <li className="hover:underline cursor-pointer">GIỚI THIỆU</li>
          <li className="hover:underline cursor-pointer">SẢN PHẨM</li>
          <li className="hover:underline cursor-pointer">KHÁCH HÀNG</li>
          <li className="hover:underline cursor-pointer">CHÍNH SÁCH</li>
          <li className="hover:underline cursor-pointer">TUYỂN DỤNG</li>
          <li className="hover:underline cursor-pointer">TIN TỨC</li>
          <li className="hover:underline cursor-pointer">LIÊN HỆ</li>
        </ul>
      </nav>
    </header>
  );
}
