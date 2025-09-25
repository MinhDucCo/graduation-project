import { ISanPham } from "@/app/components/cautrucdata";
import ShowDetailSP from "@/app/components/ShowDetailSP";

export default async function SP({ params }: { params: { ma_san_pham: string } }) {
  try {
    const maSP = params.ma_san_pham;

    // gọi API tới backend Express
    const resSP = await fetch(`http://localhost:3000/api/sanpham/${maSP}`, { cache: "no-store" });

    if (!resSP.ok) {
      throw new Error(`Lỗi fetch sản phẩm: ${resSP.status}`);
    }

    const sp: ISanPham = await resSP.json(); // backend trả về object chứ không phải mảng

    return <ShowDetailSP sp={sp} />;
  } catch (error: any) {
    console.error("Không thể fetch dữ liệu sản phẩm:", error.message);
    return <div>Không thể tải dữ liệu sản phẩm</div>;
  }
}
