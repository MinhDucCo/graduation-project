import { ISanPham } from "./components/cautrucdata";
import ShowSP from "./components/ShowSP";

export default async function Home() {
  let resHot = await fetch("http://localhost:3000/api/phu_tung_xe/");
  let sp_hot: ISanPham[] = await resHot.json();

  return (
    <div className="home">
      <div className="sphot">
        <h2 className="text-center font-semibold border-b-2 border-black-600 pb-3 bg-white my-2 text-[1.5em] uppercase">
          Sản phẩm
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {sp_hot.map((sp: ISanPham) => (
            <ShowSP key={sp.ma_san_pham} sp={sp} />
          ))}
        </div>
      </div>
    </div>
  );
}
