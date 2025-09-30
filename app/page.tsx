import { ISanPham } from "./components/cautrucdata";
import ShowSP from "./components/ShowSP";

export default async function Home() {
  // Lấy sản phẩm bán chạy
  let resHot = await fetch("http://localhost:3000/api/phu_tung_xe/");
  let sp_hot: ISanPham[] = await resHot.json();
  // Lấy sản phẩm có an_hien = 2
  let resAnHien2 = await fetch("http://localhost:3000/api/san_pham/an_hien_2");
  let sp_an_hien2: ISanPham[] = await resAnHien2.json();
  // Lấy sản phẩm có an_hien = 3
  let resAnHien3 = await fetch("http://localhost:3000/api/san_pham/an_hien_3");
  let sp_an_hien3: ISanPham[] = await resAnHien3.json();


  return (
    <div className="home">
  {/* Sản phẩm nổi bật */}
  <div className="sphot w-[90%] mb-20 mx-auto">
    <h2 className="relative text-center font-bold text-red-600 uppercase my-6 text-[1.5em]">
      <span className="px-4 bg-white">Sản Phẩm Bán Chạy</span>
      <span className="absolute left-0 top-1/2 w-full border-t-2 border-gray-300 -z-10"></span>
    </h2>

    <div className="grid grid-cols-4 gap-4">
      {sp_hot.map((sp: ISanPham) => (
        <ShowSP key={sp.ma_san_pham} sp={sp} />
      ))}
    </div>
  </div>

  {/* Sản phẩm Xe Máy an_hien 2 */}
  <div className="sphot w-[90%] mb-20 mx-auto">
    <h2 className="relative font-bold text-red-600 uppercase my-6 text-[1.5em] border-b-2 border-gray-300">
  <span className="bg-white pr-4">PHỤ TÙNG XE MÁY</span>
</h2>
    <div className="grid grid-cols-4 gap-4">
      {sp_an_hien2.map((sp: ISanPham) => (
        <ShowSP key={sp.ma_san_pham} sp={sp} />
      ))}
    </div>
  </div>
  {/* Sản phẩm Xe Oto an_hien 3 */}
<div className="sphot w-[90%]  mb-20 mx-auto">
  <h2 className="relative font-bold text-red-600 uppercase my-6 text-[1.5em] border-b-2 border-gray-300">
    <span className="bg-white pr-4">PHỤ TÙNG ÔTÔ</span>
  </h2>
  <div className="grid grid-cols-4 gap-4">
    {sp_an_hien3.map((sp: ISanPham) => (
      <ShowSP key={sp.ma_san_pham} sp={sp} />
    ))}
  </div>
</div>

</div>
    
  );
}
