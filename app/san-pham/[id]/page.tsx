import { ISanPham, ILoai } from "../../components/cautrucdata";
import ShowSP from "../../components/ShowSP";

export default async function SanPhamTheoLoai({ params }: { params: { id: string } }) {
  // Lấy danh sách sản phẩm theo id_loai_xe
  let resSP = await fetch(`http://localhost:3000/api/san_pham/loai/${params.id}`, { cache: "no-store" });
  let sanpham: ISanPham[] = await resSP.json();

  // Lấy thông tin loại xe để hiển thị tên
  let resLoai = await fetch(`http://localhost:3000/api/loai_xe/${params.id}`, { cache: "no-store" });
  let loai: ILoai = await resLoai.json();

  return (
    <div className="w-[90%] mx-auto my-6">
      <h2 className="text-xl font-bold mb-4 text-red-600 uppercase">
        {loai.ten_loai}
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {sanpham.map((sp) => (
          <ShowSP key={sp.ma_san_pham} sp={sp} />
        ))}
      </div>
    </div>
  );
}
