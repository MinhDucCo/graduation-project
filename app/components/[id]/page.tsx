import { ISanPham } from '@/app/components/cautrucdata';
import ShowDetailSP from "@/app/components/ShowDetailSP";
export default async function SP({ params }: { params: { id: number } }) {
    let id = params.id;
    // lấy tham số id trong route
    let resSP = await fetch(`http://localhost:3000/api/sp/${id}`);
    let kq_sp: any = await resSP.json();
    let sp: ISanPham = kq_sp as ISanPham;
    return <ShowDetailSP sp={sp} />
}