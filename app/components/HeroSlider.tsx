// "use client"; //useEffect, useState, onClick, window, document,... chỉ dùng được trong "use client" component.
// import { useEffect, useState } from 'react';
// const slides = [
//   {
//     image: '/image/slide111.jpg',
//     title: 'Du lịch cùng benthanhtourist',
//     subtitle: 'Cập nhật tin tức mới nhất về tour du lịch chất lượng cao',
//   },
//   {
//     image: '/image/slide222.jpg',
//     title: 'Tour hấp dẫn mỗi mùa',
//     subtitle: 'Đặt ngay để nhận ưu đãi đặc biệt',
//   },
//   {
//     image: '/image/slide333.jpg',
//     title: 'Chuyến đi trong mơ',
//     subtitle: 'Trải nghiệm hành trình tuyệt vời',
//   },
// ];

// const HeroSlider = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex(prev => (prev + 1) % slides.length);
//     }, 4500);
//     return () => clearInterval(interval);
//   }, []);

//   const { image, title, subtitle } = slides[currentIndex];

//   return (
//     <section
//       className="relative bg-cover bg-center bg-no-repeat text-white min-h-[500px] flex items-center justify-center transition-all duration-1000 ease-in-out"
//       style={{ backgroundImage: `url(${image})` }}
//     >
//       <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]"></div>
//       <div className="relative z-10 text-center px-4 max-w-3xl">
//         <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
//         <p className="text-xl mb-6">{subtitle}</p>
//         <div className="flex justify-center gap-4">
//           {/* <Link to="/news" className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
//             Xem tin tức
//           </Link>
//           <Link to="/tours" className="bg-secondary text-black px-6 py-2 rounded-full font-semibold hover:bg-secondary/90 transition">
//             Khám phá tour
//           </Link> */}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSlider;
