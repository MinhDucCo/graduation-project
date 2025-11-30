"use client";
import { ISanPham, IBienThe } from "../components/cautrucdata";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShowDetailSP({ sp }: { sp: ISanPham }) {
  const router = useRouter();
  // Nếu API không trả `bien_the_san_phams`, tạo biến thể giả từ các trường top-level
  const computedVariants: IBienThe[] = (sp.bien_the_san_phams && Array.isArray(sp.bien_the_san_phams) && sp.bien_the_san_phams.length>0)
    ? sp.bien_the_san_phams
    : [
        {
          id: sp.id ? Number(String(sp.id).replace(/[^0-9]/g, '')) || 0 : 0,
          ma_san_pham: sp.ma_san_pham || sp.id || '' as any,
          mau_sac: sp.mau_sac || '',
          gia: (sp.gia ?? sp.price ?? 0) as any,
          so_luong: (sp.so_luong ?? sp.stock ?? 0) as any,
          hinh: sp.hinh || sp.imageUrl || '',
          hinh_phu1: sp.hinh_phu1 || '',
          hinh_phu2: sp.hinh_phu2 || '',
          hinh_phu3: sp.hinh_phu3 || '',
          ghi_chu: sp.ghi_chu || '',
        },
      ];

  const [selectedVariant, setSelectedVariant] = useState<IBienThe | undefined>(
    computedVariants[0]
  );
  // State bình luận
  const [binhLuanList, setBinhLuanList] = useState<any[]>([]);
  const [noiDung, setNoiDung] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" } | null>(null);




  // ✅ Hàm hiệu ứng bay vào giỏ hàng
  const animateToCart = () => {
    const img = document.getElementById("product-image") as HTMLImageElement | null;
    const cart = document.getElementById("cart-icon") as HTMLElement | null;

    if (!img || !cart) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const flyImg = img.cloneNode(true) as HTMLImageElement;
    flyImg.style.position = "fixed";
    flyImg.style.left = imgRect.left + "px";
    flyImg.style.top = imgRect.top + "px";
    flyImg.style.width = imgRect.width + "px";
    flyImg.style.height = imgRect.height + "px";
    flyImg.style.transition = "all 0.8s ease-in-out";
    flyImg.style.zIndex = "9999";

    document.body.appendChild(flyImg);

    setTimeout(() => {
      flyImg.style.left = cartRect.left + "px";
      flyImg.style.top = cartRect.top + "px";
      flyImg.style.width = "40px";
      flyImg.style.height = "40px";
      flyImg.style.opacity = "0.3";
    }, 50);

    setTimeout(() => flyImg.remove(), 900);
  };


  const hinhPhu = [
    selectedVariant?.hinh ||
    "https://via.placeholder.com/400x300?text=Hinh+Chinh",
    selectedVariant?.hinh_phu1 ||
    "https://placehold.co/400x300?text=Hinh+Phu+1",
    selectedVariant?.hinh_phu2 ||
    "https://placehold.co/400x300?text=Hinh+Phu+2",
    selectedVariant?.hinh_phu3 ||
    "https://placehold.co/400x300?text=Hinh+Phu+3",
  ]; const [hinhChinh, setHinhChinh] = useState<string>(hinhPhu[0]);

  useEffect(() => {
    setHinhChinh(hinhPhu[0]);
  }, [selectedVariant]);

  useEffect(() => {
    const img = new Image();
    img.src = hinhChinh;
    img.onerror = () =>
      setHinhChinh("https://via.placeholder.com/400x300?text=Loi+Tai+Hinh");
  }, [hinhChinh]);

  // ✅ Khi user đăng nhập -> gộp giỏ hàng tạm (sessionStorage) vào DB
  useEffect(() => {
    const mergeCartToDB = async () => {
      const user =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "null")
          : null;

      if (!user) return; // nếu chưa đăng nhập thì bỏ qua

      const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "[]");

      if (sessionCart.length > 0) {
        for (const item of sessionCart) {
          await fetch("http://localhost:3000/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...item,
              id_user: user.id, // dùng id của user sau đăng nhập
            }),
          });
        }

        sessionStorage.removeItem("cart"); // xóa giỏ hàng tạm sau khi gộp
        console.log("✅ Gộp giỏ hàng session vào DB thành công!");
      }
    };

    mergeCartToDB();
  }, []);

  // ✅ Kiểm tra user đã mua và nhận hàng sản phẩm này
  // useEffect(() => {
  //   const checkPurchased = async () => {
  //     const user = JSON.parse(localStorage.getItem("user") || "null");
  //     if (!user) return;

  //     try {
  //       const res = await fetch(`http://localhost:3000/api/orders?userId=${user.id}&status=delivered`);
  //       const orders = await res.json();
  //       const purchased = orders.some((order: any) =>
  //         order.items.some((item: any) => item.id_san_pham === sp.ma_san_pham)
  //       );

  //       setCanReview(purchased);
  //     } catch (err) {
  //       console.error("Lỗi kiểm tra đơn hàng:", err);
  //     }
  //   };

  //   checkPurchased();
  // }, [sp.ma_san_pham]);

  // 🟢 Lấy danh sách bình luận khi vào trang
  useEffect(() => {
    async function fetchBinhLuan() {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comments?id_san_pham=${sp.ma_san_pham}`
        );
        const data = await res.json();
        setBinhLuanList(data);
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBinhLuan();
  }, [sp.ma_san_pham]);


  // 🛒 Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    animateToCart(); // Hiệu ứng bay ảnh vào giỏ hàng

    if (!selectedVariant) {
      alert("Vui lòng chọn màu sắc sản phẩm!");
      return;
    }

    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;

    const newItem = {
      ten_san_pham: sp.ten_san_pham,
      gia: selectedVariant.gia,
      id_user: user ? user.id : 10, // ✅ Nếu chưa login → lưu mặc định cho user ID 10
      id_san_pham: sp.ma_san_pham,
      so_luong: 1,
      hinh: selectedVariant.hinh,
      mau_sac: selectedVariant.mau_sac,
    };

    // ✅ Luôn gửi vào DB (dù có đăng nhập hay không)
    try {
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      const result = await res.json();

      if (!res.ok) {
        alert("❌ Thêm thất bại: " + result.message);
        return;
      }

      // ✅ Cập nhật Header không cần reload
      window.dispatchEvent(new Event("cart-updated"));

    } catch (err) {
      console.error("🚨 Lỗi khi thêm giỏ hàng:", err);
      alert("Không thể thêm vào giỏ hàng!");
    }




    // 🟢 Lấy danh sách bình luận khi vào trang
    //   useEffect(() => {
    //   async function fetchBinhLuan() {
    //     try {
    //       const res = await fetch(
    //         `http://localhost:3000/api/comments?id_san_pham=${sp.ma_san_pham}`
    //       );
    //       const data = await res.json();
    //       setBinhLuanList(data);
    //     } catch (err) {
    //       console.error("Lỗi khi tải bình luận:", err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   }
    //   fetchBinhLuan();
    // }, [sp.ma_san_pham]);
  };
  // ✅ Gửi bình luận mới
  // const handleSubmitBinhLuan = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const user = JSON.parse(localStorage.getItem("user") || "null");
  //   if (!user) {
  //     console.log("Bạn cần đăng nhập để bình luận!");
  //     return;
  //   }

  //   if (!noiDung.trim()) {
  //     console.log("Vui lòng nhập nội dung bình luận!");
  //     return;
  //   }

  //   try {
  //     // Gửi bình luận lên server
  //     const res = await fetch("http://localhost:3000/api/comments", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         id_user: user.id,
  //         id_san_pham: Number(sp.ma_san_pham),
  //         noi_dung: noiDung,
  //         trang_thai: 1,
  //         ngay_tao: new Date(),
  //       }),
  //     });

  //     if (!res.ok) {
  //       const errData = await res.json();
  //       console.log("Có lỗi xảy ra khi gửi bình luận:", errData.message);
  //       return;
  //     }

  //     // 🔹 Fetch lại toàn bộ bình luận để hiển thị tên người dùng đúng
  //     const resBinhLuan = await fetch(`http://localhost:3000/api/comments?id_san_pham=${sp.ma_san_pham}`);
  //     if (!resBinhLuan.ok) {
  //       console.log("Không thể tải lại bình luận sau khi gửi");
  //       return;
  //     }
  //     const data = await resBinhLuan.json();
  //     setBinhLuanList(data);
  //     setNoiDung("");

  //   } catch (err) {
  //     console.error("Lỗi gửi bình luận:", err);
  //   }
  // }
  const handleSubmitBinhLuan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // reset thông báo

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      setMessage({ text: "Bạn cần đăng nhập để bình luận!", type: "error" });
      return;
    }

    if (!noiDung.trim()) {
      setMessage({ text: "Vui lòng nhập nội dung bình luận!", type: "error" });
      return;
    }

    try {
      // Gửi bình luận lên server
      const res = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: user.id,
          id_san_pham: Number(sp.ma_san_pham),
          noi_dung: noiDung,
          trang_thai: 1,
          ngay_tao: new Date(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessage({ text: "Có lỗi xảy ra khi gửi bình luận: " + errData.message, type: "error" });
        return;
      }

      // 🔹 Fetch lại danh sách bình luận để hiển thị tên người dùng
      const resBinhLuan = await fetch(`http://localhost:3000/api/comments?id_san_pham=${sp.ma_san_pham}`);
      if (!resBinhLuan.ok) {
        setMessage({ text: "Không thể tải lại bình luận sau khi gửi", type: "error" });
        return;
      }

      const data = await resBinhLuan.json();
      setBinhLuanList(data);
      setNoiDung("");

      // Hiển thị thông báo thành công
      setMessage({ text: "Bình luận đã được gửi thành công!", type: "success" });

    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      setMessage({ text: "Có lỗi xảy ra khi gửi bình luận", type: "error" });
    }
  };
  ;





  // 🟢 Mua Ngay → thêm sản phẩm rồi chuyển Checkout
  const handleBuyNow = async () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn màu sắc sản phẩm!");
      return;
    }

    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;

    const newItem = {
      ten_san_pham: sp.ten_san_pham,
      gia: selectedVariant.gia,
      id_user: user ? user.id : 10,
      id_san_pham: sp.ma_san_pham,
      so_luong: 1,
      hinh: selectedVariant.hinh,
      mau_sac: selectedVariant.mau_sac,
    };

    try {
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      const result = await res.json();
      if (!res.ok) {
        alert("❌ Thêm thất bại: " + result.message);
        return;
      }

      window.dispatchEvent(new Event("cart-updated"));

      // Chuyển sang Checkout
      router.push("/Checkout");
    } catch (err) {
      console.error(err);
      alert("Không thể thêm vào giỏ hàng!");
    }
  };


  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh sản phẩm */}
        <div className="md:w-1/2">
          <img
            id="product-image"
            src={hinhChinh}
            alt={sp.ten_san_pham}
            className="w-full h-[520px] object-cover rounded-lg shadow-md"
          />
          <div className="flex gap-4 mt-4">
            {hinhPhu.map((hinh, index) => (
              <img
                key={index}
                src={hinh}
                alt={`Hình phụ ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition ${hinhChinh === hinh
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-gray-400"
                  }`}
                onClick={() => setHinhChinh(hinh)}
                onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/400x300?text=Loi+Tai+Hinh+Phu")
                }
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {sp.ten_san_pham}
            </h3>

            <p className="text-2xl text-red-600 font-semibold mb-4">
              {selectedVariant
                ? Number(selectedVariant.gia).toLocaleString("vi-VN") + " ₫"
                : "Chưa có giá"}
            </p>

            <div className="mb-4">
              <b>Màu sắc:</b>
              <div className="flex gap-2 mt-2 flex-wrap">
                {sp.bien_the_san_phams?.map((bt, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(bt)}
                    className={`px-4 py-2 rounded-lg border-2 transition ${selectedVariant?.id === bt.id
                        ? "border-blue-600 bg-white text-black"
                        : "border-gray-300 bg-white text-black hover:border-blue-400"
                      }`}
                  >
                    {bt.mau_sac}
                  </button>


                ))}
              </div>
            </div>

            <p className="text-gray-700 mb-2">
              <b>Số lượng còn:</b> {selectedVariant?.so_luong ?? "Không có"}
            </p>

            <p className="text-gray-700 mb-2">
              <b>Mô tả:</b> {sp.mo_ta}
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              🛒 Thêm vào giỏ hàng
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl"
            >
              Mua Ngay
            </button>

          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Bình luận sản phẩm</h2>

        {/* 🔹 Form nhập bình luận */}
        <form onSubmit={handleSubmitBinhLuan} className="mb-6">
          <textarea
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            placeholder="Nhập bình luận của bạn..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            rows={3}
          />
          {/* css báo lỗi*/}
          {message && (
            <p
              className={`mt-2 text-red-600 text-center text-bg ${message.type === "error" ? "text-red-600" : "text-green-600"} font-bold`}
            >
              {message.text}
            </p>

          )}

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Gửi bình luận
          </button>
        </form>





        {loading ? (
          <p>Đang tải bình luận...</p>
        ) : binhLuanList.length > 0 ? (
          <div className="space-y-4">
            {binhLuanList.map((bl) => (
              <div
                key={bl.id}
                className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {bl.user?.ho_ten?.[0]?.toUpperCase() || bl.id_user}
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800">
                      {bl.user?.ho_ten || `Người dùng #${bl.id_user}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(bl.ngay_tao).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{bl.noi_dung}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có bình luận nào.</p>
        )}

      </div>
    </div>

  );
}
