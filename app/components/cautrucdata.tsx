export interface ILoai {
  id: number;
  ten_loai: string;
  thu_tu: number;
  an_hien: number;
}


// Bảng sản phẩm gốc (phu_tung_xe)
export interface ISanPham {
  ma_san_pham: number;   // mã sản phẩm (id)
  ten_san_pham: string;  // tên sản phẩm
  mo_ta: string;         // mô tả
  id_loai_xe: number;    // id loại xe
  an_hien: number;       // ẩn hiện
  variants?: IBienThe[]; // danh sách biến thể (quan hệ 1-n)
  bien_the_san_phams?: IBienThe[];
}

// Bảng biến thể sản phẩm (bien_the_san_pham)
export interface IBienThe {
  id: number;            // id biến thể
  ma_san_pham: number;   // id sản phẩm cha
  mau_sac: string;       // màu sắc
  gia: number;           // giá theo màu
  so_luong: number;      // số lượng tồn
  hinh: string | null;   // hình ảnh chính của biến thể
  hinh_phu1: string | null;
  hinh_phu2: string | null;
  hinh_phu3: string | null;
}
export interface ICart {
    id : number 
    ten_san_pham : string;
    gia : number;
    id_user : number;
    id_san_pham : number;
    so_luong : number;
    ngay_them : string;
    hinh : string;
    mau_sac : string;
}
export interface IUser {
  id: number;
  email: string;
  mat_khau: string;
  ho_ten?: string;
  dia_chi?: string;
  dien_thoai?: string;
  vai_tro?: string;
  khoa?: boolean;
  hinh?: string;
  email_verified_at?: string;
  remember_token?: string;
  created_at?: string;
}

