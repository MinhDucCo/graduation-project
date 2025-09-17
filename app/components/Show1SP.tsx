import Link from "next/link";
import { ISanPham } from "./cautrucdata";

export default function Show1SP(props: { sp: ISanPham }) {
  const sp = props.sp;

  return (
  <div className="text-center border border-gray-300 rounded-xl p-4 shadow-lg bg-white font-sans">
    <h3 className="m-2 text-xl font-bold h-[60px] overflow-hidden">
      <Link href={`/sp/${sp.id}`}>
        <p className="text-blue-600 hover:underline">{sp.ten_sp}</p>
      </Link>
    </h3>
    <img
      src={sp.hinh}
      alt={sp.ten_sp}
      className="w-full h-[250px] object-cover rounded-md"
    />
    <p className="py-2 text-red-600 text-base font-semibold">
      Giá: {sp.gia_km.toLocaleString()}₫
    </p>
    <p className="py-1 text-sm text-gray-500">Cập nhật: {sp.ngay}</p>
    <p className="py-1 text-sm text-gray-500">Lượt xem: {sp.luot_xem}</p>
  </div>
);
}
