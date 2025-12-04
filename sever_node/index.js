/**
 * @typedef {import('./database.js')} DB
 */
/** @type {DB} */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("GOOGLE_CLIENT_ID (server):", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_ID (server):", process.env.GOOGLE_CLIENT_ID);
const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const session = require("express-session");
const router = express.Router();
const querystring = require("querystring"); // ✅ thêm dòng này
const qs = require("qs");
const moment = require("moment");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;




const { sendVerificationEmail } = require("./utils/sendEmail.js");
const {
  sequelize,
  Users,
  PhuTungXeModel,
  LoaiXeModel,
  BienTheSanPhamModel,
  GioHangModel,
  LienHeModel,
  DonHangModel,
  ChiTietDonHangModel,
  BinhLuan
} = require("./database.js");
const app = express();
const routes = require("./Routes.js");
app.use("/api", routes);
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 ngày
  })
);
const port = 3000;
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3100", // frontend (Next.js)
  credentials: true, // cho phép cookie và session
}));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000"],
      imgSrc: ["'self'", "data:", "https://example.com"],
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// cấu hình passport google strategyq
// Serialize / deserialize user cho session
passport.serializeUser((user, done) => {
  // user la object user trong DB
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ⚙️ Cau hinh GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,      // dien vao .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(new Error("Google khong tra ve email"));
        }

        // Tim user theo email
        let user = await Users.findOne({ where: { email } });

        if (!user) {
          // Neu chua co -> tao nhanh user moi
          user = await Users.create({
            email,
            ho_ten: profile.displayName || "Nguoi dung Google",
            mat_khau: "", // co the de trong, vi login qua Google
            vai_tro: 0,   // user thuong
          });
        }

        // Tra user cho passport
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send(`
    <h1>API Phụ tùng xe</h1>
    <p>Truy cập các API:</p>
    <ul>

      <li><a href="/api/loai_xe/1">/api/loai_xe/1</a> - Lấy thông tin loại xe</li>
      <li><a href="/api/phu_tung_xe">/api/phu_tung_xe</a> - Lấy danh sách phụ tùng xe</li>
      <li><a href="/api/auth/login">/api/auth/login</a> - Đăng nhập</li>
      <li><a href="/api/sanpham/1">/api/sanpham/1</a> - Xem chi tiết sản phẩm</li>
    </ul>
  `);
});


app.get("/api/loai_xe", async (req, res) => {
  try {
    const loaiXeList = await LoaiXeModel.findAll({
      where: { an_hien: 1 }, // chỉ lấy loại xe đang hiển thị
      order: [["thu_tu", "ASC"], ["id", "ASC"]],
    });
    res.json(loaiXeList);
  } catch (error) {
    console.error("Lỗi lấy danh sách loại xe:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


app.get("/api/loai_xe/:id", async (req, res) => {
  try {
    const loai = await LoaiXeModel.findByPk(req.params.id);
    if (loai) {
      res.json(loai);
    } else {
      res.status(404).json({ message: "Không tìm thấy loại xe" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/phu_tung_xe", async (req, res) => {
  try {
    const sp_arr = await PhuTungXeModel.findAll({
      where: { an_hien: 1 }, // chỉ lấy sp đang hiện
      include: [
        { model: LoaiXeModel, attributes: ["ten_loai"] },
        { model: BienTheSanPhamModel } // lấy biến thể + hình phụ
      ],
      order: [["ma_san_pham", "ASC"]],
    });

    res.json(sp_arr);
  } catch (error) {
    console.error("❌ Lỗi API /api/phu_tung_xe:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});
// app.js hoặc routes/sanpham.js

app.get("/api/sanpham_hot", async (req, res) => {
  try {
    const sp_hot = await PhuTungXeModel.findAll({
      include: [{
        model: BienTheSanPhamModel,
        attributes: ['mau_sac', 'gia', 'so_luong', 'hinh']
      }],
      where: { an_hien: 1 },
      limit: 4
    });

    res.json(sp_hot);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm hot:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


app.get("/api/sanpham/:ma_san_pham", async (req, res) => {
  try {
    const { ma_san_pham } = req.params;

    // Lấy thông tin sản phẩm
    const sp = await PhuTungXeModel.findOne({ where: { ma_san_pham } });
    if (!sp) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Lấy danh sách biến thể của sản phẩm
    const bienThe = await BienTheSanPhamModel.findAll({
      where: { ma_san_pham: sp.ma_san_pham },
    });

    // Trả về dữ liệu sản phẩm kèm biến thể
    res.json({
      ...sp.toJSON(),
      bien_the_san_phams: bienThe,
    });
  } catch (error) {
    console.error("Lỗi API /api/sanpham/:ma_san_pham:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// ;lấy tất cả sản phẩm có an_hien = 2 (Xe máy) kèm phân trang
  app.get("/api/san_pham/an_hien_2", async (req, res) => {
    try {
      // Lấy page & limit từ query, có mặc định
      let page = parseInt(req.query.page) || 1; // trang hiện tại
      let limit = parseInt(req.query.limit) || 8; // số sản phẩm mỗi trang
      let offset = (page - 1) * limit;
  const sortOrder = req.query.sortOrder === "DESC" ? "DESC" : "ASC";
      // Lấy danh sách sản phẩm kèm tổng số sản phẩm
      const { rows: sp_arr, count: total } = await PhuTungXeModel.findAndCountAll({
        where: { an_hien: 2 },
        include: [
          {
            model: LoaiXeModel,
            attributes: ["ten_loai"], // lấy tên loại xe
          },
          {
            model: BienTheSanPhamModel,
            attributes: ["mau_sac", "gia", "so_luong", "hinh"], // lấy thông tin biến thể
          },
        ],
        order: [[BienTheSanPhamModel, "gia", sortOrder]], // ✅ sắp xếp theo giá ở bảng biến thể
        limit: limit,
        offset: offset,
      });

      res.json({
        data: sp_arr,
        pagination: {
          total,               // tổng số sản phẩm
          page,                // trang hiện tại
          limit,               // số sản phẩm mỗi trang
          totalPages: Math.ceil(total / limit), // tổng số trang
        },
      });
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  });

// Lấy tất cả sản phẩm có an_hien = 3 (Ô tô) kèm phân trang
app.get("/api/san_pham/an_hien_3", async (req, res) => {
  try {
    // Lấy query page, limit, sortOrder từ client
    let page = parseInt(req.query.page) || 1; // trang hiện tại
    let limit = parseInt(req.query.limit) || 8; // số sản phẩm mỗi trang
    let offset = (page - 1) * limit;
    const sortOrder = req.query.sortOrder === "DESC" ? "DESC" : "ASC"; // sắp xếp tăng/giảm

    // Lấy danh sách sản phẩm kèm tổng số sản phẩm
    const { rows: sp_arr, count: total } = await PhuTungXeModel.findAndCountAll({
      where: { an_hien: 3 }, // 🔹 chỉ lấy sản phẩm ô tô
      include: [
        {
          model: LoaiXeModel,
          attributes: ["ten_loai"], // lấy tên loại xe
        },
        {
          model: BienTheSanPhamModel,
          attributes: ["mau_sac", "gia", "so_luong", "hinh"], // lấy thông tin biến thể
        },
      ],
      order: [[BienTheSanPhamModel, "gia", sortOrder]], // ✅ sắp xếp theo giá biến thể
      limit: limit,
      offset: offset,
    });

    // Trả về dữ liệu JSON kèm phân trang
    res.json({
      data: sp_arr,
      pagination: {
        total,                     // tổng số sản phẩm
        page,                      // trang hiện tại
        limit,                     // số sản phẩm mỗi trang
        totalPages: Math.ceil(total / limit), // tổng số trang
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm an_hien=3:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


// API lấy sản phẩm có phân trang
app.get("/api/san_pham", async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 8;
    let offset = (page - 1) * limit;

    const { count, rows } = await PhuTungXeModel.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: LoaiXeModel,
          attributes: ["ten_loai"],
        },
        {
          model: BienTheSanPhamModel,
          attributes: ["mau_sac", "gia", "so_luong", "hinh"], // lấy hình từ bảng biến thể
        },
      ],
    });

    res.json({
      total: count,             // tổng số sản phẩm
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


// API tìm kiếm
app.get('/api/timkiem/:tu_khoa/:page', async (req, res) => {
  const tu_khoa = req.params.tu_khoa || '';
  const page = Number(req.params.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;

  try {
    const sp_arr = await PhuTungXeModel.findAll({
      where: {
        ten_san_pham: { [Op.like]: `%${tu_khoa}%` },
        an_hien: { [Op.in]: [1, 2, 3] },
      },
      order: [['ma_san_pham', 'ASC']],
      limit,
      offset,
    });

    // Nếu không có biến thể, trả về mảng rỗng
    const sp_arr_full = await Promise.all(
      sp_arr.map(async (sp) => {
        let bienThe = [];
        try {
          bienThe = await BienTheSanPhamModel.findAll({
            where: { ma_san_pham: sp.ma_san_pham },
          });
        } catch (err) {
          console.error('Lỗi fetch biến thể cho sp:', sp.ma_san_pham, err);
        }

        return {
          ...(sp.dataValues || sp), // fallback nếu sp không phải Sequelize instance
          bien_the_san_phams: bienThe,
        };
      })
    );

    res.json(sp_arr_full);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Không thể lấy dữ liệu sản phẩm' });
  }
});



// API đếm tổng sản phẩm
app.get('/api/timkiem/:tu_khoa/count', async (req, res) => {
  const tu_khoa = req.params.tu_khoa || '';

  try {
    const total = await PhuTungXeModel.count({
      where: {
        ten_san_pham: { [Op.iLike]: `%${tu_khoa}%` },
        an_hien: 1,
      },
    });
    res.json({ total });
  } catch (error) {
    console.error('API Count Error:', error);
    res.status(500).json({ error: 'Không thể đếm sản phẩm' });
  }
});



// 🛒 API lấy giỏ hàng của user
app.get("/api/cart", async (req, res) => {
  const { id_user } = req.query;
  const userId = id_user || 10; // Mặc định là khách

  try {
    console.log("📥 API GET /api/cart - id_user:", userId);

    const gioHang = await GioHangModel.findAll({
      where: { id_user: userId },
    });

    console.log("✅ Dữ liệu giỏ hàng từ DB:", gioHang);
    res.json(gioHang);
  } catch (error) {
    console.error("❌ Lỗi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
});
// 🛒 API thêm sản phẩm vào giỏ hàng
app.post("/api/cart/add", async (req, res) => {
  const { ten_san_pham, gia, id_user, id_san_pham, so_luong, hinh, mau_sac } = req.body;
  
  // Nếu chưa có session giỏ hàng thì tạo mảng trống
  if (!req.session.cart) {
    req.session.cart = [];
  }
  // ✅ Nếu chưa đăng nhập
  if (!id_user) {
    // Thêm vào session
    const existingItem = req.session.cart.find((item) => item.id_san_pham === id_san_pham && item.mau_sac === mau_sac);
    if (existingItem) {
      existingItem.so_luong += so_luong;
    } else {
      req.session.cart.push({
        ten_san_pham,
        gia,
        id_san_pham,
        so_luong,
        hinh,
        mau_sac,
      });
    }

    console.log("🛍️ Giỏ hàng session:", req.session.cart);
    return res.json({ message: "Đã thêm vào giỏ hàng (chưa đăng nhập)", cart: req.session.cart });
  }

  // ✅ Nếu đã đăng nhập → lưu DB
  try {
    await GioHangModel.create({
      ten_san_pham,
      gia,
      id_user,
      id_san_pham,
      so_luong,
      hinh,
      mau_sac,
      ngay_them: new Date(),
    });
    res.json({ message: "Đã thêm sản phẩm vào giỏ hàng!" });
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// Lấy toàn bộ giỏ hàng
// app.get("/api/cart", async (req, res) => {
//   const { id_user } = req.query;

//   try {
//     if (id_user) {
//       // 🧾 Đã đăng nhập → lấy DB
//       const cart = await GioHangModel.findAll({ where: { id_user } });
//       return res.json(cart);
//     } else {
//       // 🚫 Chưa đăng nhập → lấy session
//       return res.json(req.session.cart || []);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Không thể lấy giỏ hàng" });
//   }
// });

// 🗑️ Xóa sản phẩm khỏi giỏ
app.delete("/api/cart/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await GioHangModel.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xóa sản phẩm thất bại" });
  }
});


// ✅ XÓA TOÀN BỘ GIỎ HÀNG CỦA 1 USER (sau khi đặt hàng)
// DELETE /api/cart
app.delete("/api/cart/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;
    
    await CartModel.destroy({
      where: { id_user }
    });

    res.json({ success: true, message: "Giỏ hàng đã được xóa!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


//gom giỏ hàng từ guest sang user
app.post("/api/cart/merge", async (req, res) => {
  const { guestId, userId } = req.body;

  try {
    // Lấy giỏ hàng của guest
    const guestCart = await GioHangModel.findAll({ where: { id_user: guestId } });

    // Nếu không có gì thì kết thúc
    if (!guestCart.length) return res.json({ success: true, merged: false });

    for (const item of guestCart) {
      // Kiểm tra xem user đã có sản phẩm này chưa
      const exist = await GioHangModel.findOne({
        where: { id_user: userId, id_san_pham: item.id_san_pham },
      });

      if (exist) {
        // Nếu đã có → cộng dồn số lượng
        await exist.update({ quantity: exist.quantity + item.quantity });
      } else {
        // Nếu chưa có → chuyển quyền sở hữu giỏ hàng
        await item.update({ id_user: userId });
      }
    }

    res.json({ success: true, merged: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể gộp giỏ hàng" });
  }
});
// Cập nhật số lượng sản phẩm trong giỏ và kiểm tra tồn kho
app.put("/api/cart/update/:id", async (req, res) => {
  const { so_luong } = req.body;
  const { id } = req.params;

  try {
    // Lấy sản phẩm trong giỏ hàng
    const gioHangItem = await GioHangModel.findOne({ where: { id } });

    if (!gioHangItem) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Tìm biến thể sản phẩm theo mã sản phẩm
    const bienThe = await BienTheSanPhamModel.findOne({
  where: { ma_san_pham: gioHangItem.id_san_pham },
});


    if (!bienThe) {
      return res.status(404).json({ error: "Không tìm thấy biến thể sản phẩm" });
    }

    // Kiểm tra tồn kho
    if (so_luong > bienThe.so_luong) {
      return res.status(400).json({
        error: `Số lượng vượt quá tồn kho! Chỉ còn ${bienThe.so_luong} sản phẩm.`,
      });
    }

    // Cập nhật số lượng
    await GioHangModel.update({ so_luong }, { where: { id } });

    res.json({ success: true, message: "Cập nhật số lượng thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật giỏ hàng:", err);
    res.status(500).json({ error: "Cập nhật số lượng thất bại" });
  }
});

// Ham gom gio hang tu user 10 sang user that
function mergeGuestCartToUser(userId) {
  return (async () => {
    const guestCart = await GioHangModel.findAll({ where: { id_user: 10 } });

    for (const item of guestCart) {
      const exists = await GioHangModel.findOne({
        where: {
          id_user: userId,
          id_san_pham: item.id_san_pham,
          mau_sac: item.mau_sac,
        },
      });

      if (exists) {
        await exists.update({
          so_luong: exists.so_luong + item.so_luong,
        });
      } else {
        await item.update({ id_user: userId });
      }
    }

    await GioHangModel.destroy({ where: { id_user: 10 } });
    console.log("🧹 Da gom va xoa gio hang tam (id=10)");
  })();
}

// --- API Google OAuth2 đăng nhập ---
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3100/Login?error=google",
    session: true,
  }),
  async (req, res) => {
    try {
      const user = req.user; // do GoogleStrategy tra ve

      // Luu session giong login thuong
      req.session.user = {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
      };

      console.log("🔐 Google login thanh cong:", req.session.user);

      // Gop gio hang tam id_user=10
      await mergeGuestCartToUser(user.id);

      // ✅ Redirect ve NextJS /LoginSuccess (port 3100)
      return res.redirect("http://localhost:3100/LoginSuccess");
    } catch (err) {
      console.error("🔥 Loi trong google callback:", err);
      return res.redirect("http://localhost:3100/Login?error=server");
    }
  }
);

// --- API lay user theo session ---
app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Chua dang nhap" });
  }
  return res.json({ user: req.session.user });
});

// 📩 API: Đăng nhập // API đăng nhập + gôp giỏ hàng id 10
app.post("/api/auth/login", async (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });
  }

  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    // Kiểm tra mật khẩu
    let match = false;
    if (user.mat_khau.startsWith("$2b$")) {
      match = await bcrypt.compare(mat_khau, user.mat_khau);
    } else {
      match = mat_khau === user.mat_khau; 
    }

    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu!" });
    }

    // ✅ Lưu session
    req.session.user = {
      id: user.id,
      email: user.email,
      ho_ten: user.ho_ten,
      vai_tro: user.vai_tro,
    };

    console.log("🔐 Đăng nhập thành công:", req.session.user);
    // ✅ GỘP GIỎ HÀNG user 10 → user.id
    const guestCart = await GioHangModel.findAll({ where: { id_user: 10 } });
    await mergeGuestCartToUser(user.id);
    for (const item of guestCart) {
      // Kiểm tra xem đã có món trùng trong giỏ user chưa
      const exists = await GioHangModel.findOne({
        where: {
          id_user: user.id,
          id_san_pham: item.id_san_pham,
          mau_sac: item.mau_sac
        }
      });

      if (exists) {
        // Nếu có → tăng số lượng
        await exists.update({
          so_luong: exists.so_luong + item.so_luong
        });
      } else {
        // Nếu chưa có → chuyển sản phẩm sang user thật
        await item.update({ id_user: user.id });
      }
    }

    // 🗑️ Xóa sạch giỏ hàng của user 10
    await GioHangModel.destroy({ where: { id_user: 10 } });

    console.log("🧹 Đã gộp và xóa giỏ hàng tạm (id=10)");

    return res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
        dien_thoai: user.dien_thoai,
        dia_chi: user.dia_chi,
      },
    });

  } catch (err) {
    console.error("🔥 Lỗi đăng nhập:", err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
});


// 1) User bam "Dang nhap voi Google" -> redirect toi day
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2) Google redirect ve callback nay
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3001/Login?error=google",
    session: true,
  }),
  async (req, res) => {
    try {
      // req.user la user trong DB do strategy tra ve
      const user = req.user;

      // Luu session giong login thuong
      req.session.user = {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
      };

      console.log("🔐 Google login thanh cong:", req.session.user);

      // Gom gio hang user 10 vao user that
      await mergeGuestCartToUser(user.id);

      // Sau khi xong -> redirect ve trang Next
      return res.redirect("http://localhost:3100/LoginSuccess");
    } catch (err) {
      console.error("🔥 Loi trong google callback:", err);
      return res.redirect("http://localhost:3100/Login?error=server");
    }
  }
);
app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Chua dang nhap" });
  }

  return res.json({ user: req.session.user });
});



// 📩 API: Gửi thông tin liên hệ
app.post("/api/lien-he", async (req, res) => {
  const { ho_ten, email, so_dien_thoai, noi_dung } = req.body;

  // ✅ Kiểm tra dữ liệu đầu vào
  if (!ho_ten || !email || !so_dien_thoai || !noi_dung) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    // ✅ Lưu vào database
    await LienHeModel.create({
      ho_ten,
      email,
      so_dien_thoai,
      noi_dung,
      trang_thai: "chưa xử lý",
      ngay_gui: new Date(),
    });

    res.status(200).json({ message: "Gửi liên hệ thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi lưu liên hệ:", error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});
// api đăng ký tài khoản
app.post("/api/auth/register", async (req, res) => {
  const { email, mat_khau, ho_ten, dien_thoai } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const existing = await Users.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    const hash = await bcrypt.hash(mat_khau, 10);
    const token = jwt.sign({ email }, "MY_SECRET_KEY", { expiresIn: "1d" });

    await Users.create({
      email,
      mat_khau: hash,
      ho_ten,
      dien_thoai,
      remember_token: token,

    });

    await sendVerificationEmail(email, token);

    res.json({ message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// API xác nhận email
app.get("/api/auth/verify", async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, "MY_SECRET_KEY");
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) return res.status(400).json({ message: "Người dùng không tồn tại!" });

    user.email_verified_at = new Date();
    await user.save();

    res.send("<h3>Xác nhận thành công! Bạn có thể đăng nhập.</h3>");
  } catch (err) {
    res.status(400).send("<h3>Liên kết không hợp lệ hoặc đã hết hạn!</h3>");
  }
});

// Gửi OTP quên mật khẩu
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // 🔍 Kiểm tra email tồn tại
    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    // 🔢 Tạo mã OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 💾 Lưu OTP và thời hạn (5 phút)
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    await user.save();

    // ✉️ Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sxodia247@gmail.com", // Gmail thật
        pass: "kjrr hasw pafk pzjr", // App password
      },
    });

    const mailOptions = {
      from: '"GreaX Support" <sxodia247@gmail.com>',
      to: email,
      subject: "Mã xác nhận đổi mật khẩu",
      html: `
        <h3>Mã OTP khôi phục mật khẩu của bạn:</h3>
        <p style="font-size:20px;font-weight:bold;color:#007bff;">${otp}</p>
        <p>Mã có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này cho bất kỳ ai.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Đã gửi OTP ${otp} đến ${email}`);
    res.json({ message: "Đã gửi mã xác nhận qua email!" });
  } catch (err) {
    console.error("Lỗi quên mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// ✅ API: Đặt lại mật khẩu
app.post("/api/auth/reset-password", async (req, res) => {
  const { otp, newPassword } = req.body; // ❌ bỏ email

  if (!otp || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin!" });
  }

  try {
    // Tìm user theo mã OTP còn hạn
    const user = await Users.findOne({
      where: {
        otpCode: otp,
        otpExpires: { [Op.gt]: new Date() }, // OTP còn hạn
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã OTP không đúng hoặc đã hết hạn!" });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa OTP
    user.mat_khau = hashedPassword;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// API: Cập nhật thông tin cá nhân (chỉ ho_ten, dia_chi, dien_thoai)
app.put('/api/users/profile', async (req, res) => {
  try {
    const { userId, ho_ten, dia_chi, dien_thoai } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật
    await user.update({
      ho_ten: ho_ten ?? user.ho_ten,
      dia_chi: dia_chi ?? user.dia_chi,
      dien_thoai: dien_thoai ?? user.dien_thoai,
    });

    // TRẢ VỀ ĐẦY ĐỦ CÁC TRƯỜNG CẦN
    const updatedUser = await Users.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'ho_ten',
        'dia_chi',
        'dien_thoai',
        'vai_tro',
      ],
    });

    res.json({
      message: 'Cập nhật thành công',
      user: updatedUser,   // ← quan trọng!
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id, {
      attributes: ["ho_ten", "dia_chi", "dien_thoai"], // chỉ lấy 3 field cần thiết
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    res.json(user);
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// 🟢 API lấy chi tiết 1 đơn hàng
app.get("/api/donhang/:id", async (req, res) => {
  try {
    const donHang = await DonHangModel.findByPk(req.params.id, {
      include: [ChiTietDonHangModel],
    });

    if (!donHang) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
    }

    res.json(donHang);
  } catch (err) {
    console.error("Lỗi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
});

// 📦 API: Tạo đơn hàng mới
app.post("/api/orders/create", async (req, res) => {
  const { ten_nguoi_nhan, dia_chi, dien_thoai, ghi_chu, id_user, items, phuong_thuc } = req.body;

  if (!ten_nguoi_nhan || !dia_chi || !dien_thoai || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
  }

  try {
    const finalUserId = id_user ? id_user : 10;  // luôn lấy đúng user đăng nhập

    const tong_tien = items.reduce((sum, item) => sum + item.gia * item.so_luong, 0);

    const donHang = await DonHangModel.create({
      ten_nguoi_nhan,
      dia_chi,
      dien_thoai,
      ghi_chu: ghi_chu || null,
      id_user: finalUserId, // <--- QUAN TRỌNG
      status: phuong_thuc === "online" ? "Chờ thanh toán" : "Chờ xác nhận",
      phuong_thuc: phuong_thuc || "cod",
    });

    const chiTietData = items.map(item => ({
      id_don_hang: donHang.id,
      id_san_pham: item.id_san_pham,
      so_luong: item.so_luong || 1,
      gia: Math.round(item.gia),
    }));

    await ChiTietDonHangModel.bulkCreate(chiTietData);

    res.status(201).json({
      success: true,
      don_hang_id: donHang.id,
      tong_tien,
    });
  } catch (error) {
    console.error("LỖI ĐẶT HÀNG:", error);
    res.status(500).json({ error: error.message });
  }
});

// routes/orders.js
router.post('/update-status', async (req, res) => {
  const { id, status } = req.body;
  try {
    await DonHangModel.update({ status }, { where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// API: Tạo URL thanh toán VNPay (ẢO)
app.post("/api/vnpay/create_payment", (req, res) => {
  const { don_hang_id, tong_tien } = req.body;
  console.log("📦 [VNPay] Nhận yêu cầu tạo thanh toán:", { don_hang_id, tong_tien });

  const vnp_TmnCode = "2QXUI4J4"; // Mã website của bạn
  const vnp_HashSecret = "SECRET_KEY_CỦA_BẠN"; // Lấy trong trang sandbox
  const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const vnp_ReturnUrl = `http://localhost:3000/thanh-toan/ket-qua?don_hang_id=${don_hang_id}`;

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const orderId = don_hang_id.toString();

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = `Thanh toan don hang ${orderId}`;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = tong_tien * 100;
  vnp_Params["vnp_ReturnUrl"] = vnp_ReturnUrl;
  vnp_Params["vnp_IpAddr"] = req.ip || "127.0.0.1";
  vnp_Params["vnp_CreateDate"] = createDate;

  // Sắp xếp key theo ASCII
  vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: false })}`;

  console.log("🌐 [VNPay] URL thanh toán:", paymentUrl);
  return res.json({ paymentUrl });
});

//------------------------------------------------------------- API QUẢN LÝ ĐƠN HÀNG CHO ÚSER----------------------------------------------
// API lấy danh sách đơn hàng của user
app.get("/api/orders", async (req, res) => {
  const { id_user } = req.query;

  try {
    const orders = await DonHangModel.findAll({
      where: { id_user },
      include: [
        {
          model: ChiTietDonHangModel,
          as: "chi_tiet",
          include: [
            {
              model: PhuTungXeModel,
              attributes: ["ten_san_pham", "mo_ta"],
            },
            {
              model: BienTheSanPhamModel,
              attributes: ["hinh", "mau_sac", "gia"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào!" });
    }

    // 🚀 FIX QUAN TRỌNG: TRẢ STATUS DẠNG CODE
    const mapped = orders.map(o => ({
      ...o.dataValues,
      status: String(o.status).toLowerCase(),  // <= đảm bảo FE nhận "pending"
    }));

    res.json(mapped);

  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ error: err.message });
  }
});
// PUT /api/orders/:id/rating - cap nhat rating don hang
app.put("/api/orders/:id/rating", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const value = Number(rating);

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: "Rating khong hop le, chi chap nhan tu 1 den 5 sao." });
    }

    const order = await DonHangModel.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang!" });
    }

    // ❗ Don hang da co rating thi khong cho danh gia lai
    if (order.rating != null) {
      return res
        .status(400)
        .json({ message: "Don hang nay da duoc danh gia truoc do." });
    }

    await order.update({ rating: value });

    return res.json({
      message: "Danh gia thanh cong!",
      order,
    });
  } catch (err) {
    console.error("Loi cap nhat rating don hang:", err);
    return res.status(500).json({ message: "Loi server!" });
  }
});
// PUT /api/orders/cancel/:id - hủy đơn hàng
app.put("/api/orders/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DonHangModel.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    }

    // CHUẨN HÓA TRẠNG THÁI
    const st = String(order.status).toLowerCase();
    const normalized = st
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/\s+/g, ""); // bỏ khoảng trắng

    // Chỉ cho hủy nếu status là pending hoặc Chờ xác nhận
    if (!["pending", "choraxacnhan"].includes(normalized)) {
      return res.status(400).json({
        message: "Chỉ đơn hàng chờ xác nhận mới có thể hủyyy!"
      });
    }

    // Cập nhật trạng thái
    await order.update({
      status: "cancelled"
    });

    res.json(order);

  } catch (err) {
    console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});


// === API LẤY DANH SÁCH BÌNH LUẬN ===
app.get("/api/comments", async (req, res) => {
  const { id_san_pham } = req.query;
  if (!id_san_pham) {
    return res.status(400).json({ message: "Thiếu id_san_pham" });
  }

  try {
    const dsBinhLuan = await BinhLuan.findAll({
      where: { id_san_pham, trang_thai: 1 },
      order: [["ngay_tao", "DESC"]],
      attributes: ["id", "id_user", "id_san_pham", "noi_dung", "ngay_tao", "trang_thai"],
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["ho_ten"],
        }
      ],
    });

    res.json(dsBinhLuan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy bình luận" });
  }
});
app.post("/api/comments", async (req, res) => {
  const { id_user, id_san_pham, noi_dung } = req.body; // Bỏ rating

  // Kiểm tra dữ liệu bắt buộc
  if (!id_user || !id_san_pham || !noi_dung) {
    return res.status(400).json({ message: "Thiếu dữ liệu bình luận" });
  }

  try {
    const newComment = await BinhLuan.create({
      id_user,
      id_san_pham,
      noi_dung,
      trang_thai: 1, // 1 = hiển thị, 0 = ẩn
      ngay_tao: new Date(),
    });

    res.json(newComment);
  } catch (err) {
    console.error("Lỗi server khi tạo bình luận:", err);
    res.status(500).json({ message: "Lỗi server khi tạo bình luận" });
  }
});



// ==================== ADMIN API ENDPOINTS ====================

// Middleware kiểm tra admin (có thể mở rộng sau)
const checkAdmin = async (req, res, next) => {
  try {
    console.log('🔐 checkAdmin - Session:', req.session ? 'exists' : 'null');
    console.log('🔐 checkAdmin - Session user:', req.session?.user ? 'exists' : 'null');
    
    // Kiểm tra session user
    const user = req.session.user;
    if (!user) {
      console.log('❌ checkAdmin: Chưa đăng nhập');
      return res.status(401).json({ message: 'Chưa đăng nhập!' });
    }
    
    // Kiểm tra vai trò admin (vai_tro = 1 là admin)
    const vaiTro = user.vai_tro;
    console.log('🔐 checkAdmin - Vai trò:', vaiTro, 'Type:', typeof vaiTro);
    
    if (vaiTro !== 1 && vaiTro !== '1' && Number(vaiTro) !== 1) {
      console.log('❌ checkAdmin: Không có quyền truy cập, vai_tro:', vaiTro);
      return res.status(403).json({ message: 'Không có quyền truy cập!' });
    }
    
    console.log('✅ checkAdmin: Admin verified');
    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Lỗi kiểm tra admin:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

// GET /api/auth/me - Lấy thông tin user hiện tại
app.get("/api/auth/me", async (req, res) => {
  try {
    console.log('🔍 /api/auth/me called, session ID:', req.sessionID);
    console.log('🔍 Session user:', req.session.user);
    console.log('🔍 Cookies:', req.headers.cookie);
    
    const user = req.session.user;
    if (!user) {
      console.log('❌ No session user found');
      return res.status(401).json({ message: 'Chưa đăng nhập!' });
    }
    // Lấy thông tin đầy đủ từ database
    const fullUser = await Users.findByPk(user.id, {
      attributes: ['id', 'email', 'ho_ten', 'vai_tro', 'dia_chi', 'dien_thoai'],
    });
    if (!fullUser) {
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    }
    console.log('✅ User found in database, vai_tro:', fullUser.vai_tro);
    res.json({ user: fullUser });
  } catch (err) {
    console.error('Lỗi lấy thông tin user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// GET /api/admin/products - Lấy danh sách sản phẩm (admin)
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await PhuTungXeModel.findAll({
      include: [
        {
          model: BienTheSanPhamModel,
          attributes: [
            "gia",
            "so_luong",
            "hinh",
            "mau_sac",
            "hinh_phu1",
            "hinh_phu2",
            "hinh_phu3",
            "ghi_chu",
          ],
          required: false,
        },
        {
          model: LoaiXeModel,
          attributes: ["ten_loai"],
        },
      ],
      order: [["ma_san_pham", "DESC"]],
    });

    const mapped = products.map((p) => {
      const variant = p.bien_the_san_phams?.[0];

      return {
        id: p.ma_san_pham,
        ten_san_pham: p.ten_san_pham,
        loai_xe: p.loai_xe?.ten_loai || "",
        gia: variant?.gia || 0,
        so_luong: variant?.so_luong || 0,
        hinh: variant?.hinh || "",
        mo_ta: p.mo_ta,

        // ✅ thêm các trường bạn cần:
        an_hien: p.an_hien,
        mau_sac: variant?.mau_sac || "",
        hinh_phu1: variant?.hinh_phu1 || "",
        hinh_phu2: variant?.hinh_phu2 || "",
        hinh_phu3: variant?.hinh_phu3 || "",
        ghi_chu: variant?.ghi_chu || "",
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error("Lỗi lấy danh sách sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// POST /api/admin/products - Tạo sản phẩm mới
// app.post("/api/admin/products", checkAdmin, async (req, res) => {
//   try {
//     console.log('📦 POST /api/admin/products - Request body:', JSON.stringify(req.body, null, 2));
//     const { ten_san_pham, mo_ta, bien_the, id_loai_xe, an_hien } = req.body;
    
//     if (!ten_san_pham) {
//       console.log('❌ Thiếu tên sản phẩm');
//       return res.status(400).json({ message: 'Thiếu tên sản phẩm!' });
//     }
//     if (!id_loai_xe) {
//       console.log('❌ Thiếu id_loai_xe');
//       return res.status(400).json({ message: 'Thiếu loại xe (id_loai_xe)!' });
//     }
    
//     // Kiểm tra loại xe có tồn tại không
//     const idLoaiXeNum = Number(id_loai_xe);
//     if (isNaN(idLoaiXeNum) || idLoaiXeNum <= 0) {
//       console.log('❌ id_loai_xe không hợp lệ:', id_loai_xe);
//       return res.status(400).json({ message: 'ID loại xe không hợp lệ!' });
//     }
    
//     const loaiXe = await LoaiXeModel.findByPk(idLoaiXeNum);
//     if (!loaiXe) {
//       console.log('❌ Loại xe không tồn tại, id_loai_xe:', idLoaiXeNum);
//       const allLoaiXe = await LoaiXeModel.findAll({ limit: 10 });
//       console.log('📋 Danh sách loại xe có sẵn:', allLoaiXe.map(lx => ({ id: lx.id, ten: lx.ten_loai })));
//       return res.status(400).json({ 
//         message: `Loại xe với ID ${idLoaiXeNum} không tồn tại!`,
//         availableIds: allLoaiXe.map(lx => lx.id)
//       });
//     }
    
//     console.log('✅ Loại xe hợp lệ:', loaiXe.id, '-', loaiXe.ten_loai);
    
//     // Tạo sản phẩm - để DB tự tạo mã nếu không có
//     let ma_san_pham = req.body.ma_san_pham;
//     if (ma_san_pham !== undefined && ma_san_pham !== null && ma_san_pham !== '') {
//       const maNum = Number(ma_san_pham);
//       if (!isNaN(maNum) && Number.isInteger(maNum) && maNum > 0) {
//         ma_san_pham = maNum;
//       } else {
//         console.log('❌ ma_san_pham được cung cấp không phải số hợp lệ, sẽ để DB tạo tự động');
//         ma_san_pham = undefined;
//       }
//     } else {
//       ma_san_pham = undefined;
//     }

//     console.log('✅ Tạo sản phẩm, dùng ma_san_pham:', ma_san_pham ?? '(auto)');
    
//     let product;
//     try {
//       const createPayload = {
//         ten_san_pham,
//         mo_ta: mo_ta || '',
//         id_loai_xe: Number(id_loai_xe),
//         an_hien: an_hien !== undefined ? Number(an_hien) : 1,
//       };
//       if (ma_san_pham !== undefined) {
//         createPayload.ma_san_pham = ma_san_pham;
//       }

//       product = await PhuTungXeModel.create(createPayload);
//       console.log('✅ Sản phẩm đã được tạo:', product.ma_san_pham);
//     } catch (createError) {
//       console.error('❌ Lỗi khi tạo sản phẩm trong database:', createError);
//       console.error('❌ Error name:', createError.name);
//       console.error('❌ Error message:', createError.message);
      
//       if (createError.name === 'SequelizeUniqueConstraintError') {
//         return res.status(400).json({ 
//           message: 'Mã sản phẩm đã tồn tại!', 
//           error: createError.message 
//         });
//       }
//       if (createError.name === 'SequelizeForeignKeyConstraintError') {
//         return res.status(400).json({ 
//           message: 'Loại xe không hợp lệ!', 
//           error: createError.message 
//         });
//       }
//       if (createError.name === 'SequelizeValidationError') {
//         return res.status(400).json({ 
//           message: 'Dữ liệu không hợp lệ!', 
//           error: createError.message,
//           errors: createError.errors 
//         });
//       }
      
//       throw createError;
//     }
    
//     // Tạo biến thể nếu có
//     if (bien_the && Array.isArray(bien_the) && bien_the.length > 0) {
//       console.log('✅ Tạo biến thể, số lượng:', bien_the.length);

//       // Helper: parse number from strings like "1.000.000" or "1,000,000"
//       const parseNumberSafe = (val) => {
//         if (val === undefined || val === null) return 0;
//         if (typeof val === 'number') return val;
//         const s = String(val).trim();
//         if (s === '') return 0;
//         const cleaned = s.replace(/[.,\s]/g, '');
//         const n = Number(cleaned);
//         return isNaN(n) ? 0 : n;
//       };

//       const bienTheData = bien_the.map((bt) => {
//         const gia = parseNumberSafe(bt.gia);
//         const so_luong = Math.max(0, Math.floor(parseNumberSafe(bt.so_luong)));
//         const hinh = (bt.hinh || '').substring(0, 255);

//         return {
//           ma_san_pham: product.ma_san_pham,
//           mau_sac: (bt.mau_sac || '').substring(0, 100),
//           gia: gia >= 0 ? gia : 0,
//           so_luong: so_luong,
//           hinh: hinh,
//           hinh_phu1: (bt.hinh_phu1 || '').substring(0, 255),
//           hinh_phu2: (bt.hinh_phu2 || '').substring(0, 255),
//           hinh_phu3: (bt.hinh_phu3 || '').substring(0, 255),
//           ghi_chu: (bt.ghi_chu || '').substring(0, 255),
//         };
//       });

//       console.log('🧾 Dữ liệu biến thể chuẩn bị lưu:', JSON.stringify(bienTheData, null, 2));

//       try {
//         const createdVariants = await BienTheSanPhamModel.bulkCreate(bienTheData);
//         try {
//           const createdInfo = createdVariants.map(v => ({ id: v.id, ma_san_pham: v.ma_san_pham, gia: v.gia, so_luong: v.so_luong }));
//           console.log('✅ Biến thể đã được tạo, chi tiết:', JSON.stringify(createdInfo, null, 2));
//         } catch (e) {
//           console.log('✅ Biến thể đã được tạo (không thể in chi tiết):', e?.message || e);
//         }
//       } catch (bienTheError) {
//         console.error('❌ Lỗi khi tạo biến thể:', bienTheError);
//         console.warn('⚠️ Sản phẩm đã được tạo nhưng biến thể thất bại');
//       }
//     }
    
//     // Lấy lại sản phẩm với biến thể
//     const productWithVariants = await PhuTungXeModel.findByPk(product.ma_san_pham, {
//       include: [
//         { model: LoaiXeModel, attributes: ["ten_loai"], required: false },
//         { model: BienTheSanPhamModel, required: false },
//       ],
//     });
    
//     if (!productWithVariants) {
//       console.error('❌ Không tìm thấy sản phẩm sau khi tạo:', product.ma_san_pham);
//       return res.status(500).json({ 
//         message: 'Lỗi server! Không thể lấy lại sản phẩm sau khi tạo.',
//         error: 'Product not found after creation'
//       });
//     }
    
//     const productJSON = productWithVariants.toJSON ? productWithVariants.toJSON() : productWithVariants;
    
//     if (!productJSON.bien_the_san_phams) {
//       productJSON.bien_the_san_phams = [];
//     } else if (!Array.isArray(productJSON.bien_the_san_phams)) {
//       productJSON.bien_the_san_phams = [];
//     }
    
//     console.log('✅ Trả về sản phẩm đã tạo:', productJSON.ma_san_pham);
//     res.status(201).json(productJSON);
//   } catch (err) {
//     console.error('❌ Lỗi tạo sản phẩm:', err);
//     console.error('❌ Error name:', err.name);
//     console.error('❌ Error message:', err.message);
    
//     const errorResponse = {
//       message: 'Lỗi server!',
//       error: err.message,
//     };
//     res.status(500).json(errorResponse);
//   }
// });
// POST /api/admin/products - Tao san pham moi
app.post("/api/admin/products", checkAdmin, async (req, res) => {
  try {
    console.log("=== POST /api/admin/products ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { ten_san_pham, mo_ta, bien_the, id_loai_xe, an_hien } = req.body;

    if (!ten_san_pham) {
      return res.status(400).json({ message: "Thieu ten san pham!" });
    }
    if (!id_loai_xe) {
      return res.status(400).json({ message: "Thieu loai xe (id_loai_xe)!" });
    }

    const idLoaiXeNum = Number(id_loai_xe);
    if (isNaN(idLoaiXeNum) || idLoaiXeNum <= 0) {
      return res.status(400).json({ message: "ID loai xe khong hop le!" });
    }

    const loaiXe = await LoaiXeModel.findByPk(idLoaiXeNum);
    if (!loaiXe) {
      return res.status(400).json({ message: "Loai xe khong ton tai!" });
    }

    // tao san pham
    const product = await PhuTungXeModel.create({
      ten_san_pham,
      mo_ta: mo_ta || "",
      id_loai_xe: idLoaiXeNum,
      an_hien: an_hien !== undefined ? Number(an_hien) : 1,
    });

    // tao bien the (neu co)
    if (bien_the && Array.isArray(bien_the) && bien_the.length > 0) {
      const parseNumberSafe = (val) => {
        if (val === undefined || val === null) return 0;
        if (typeof val === "number") return val;
        const s = String(val).trim();
        if (s === "") return 0;
        const cleaned = s.replace(/[.,\s]/g, "");
        const n = Number(cleaned);
        return isNaN(n) ? 0 : n;
      };

      const bienTheData = bien_the.map((bt) => {
        const gia = parseNumberSafe(bt.gia);
        const so_luong = Math.max(
          0,
          Math.floor(parseNumberSafe(bt.so_luong))
        );

        return {
          ma_san_pham: product.ma_san_pham || product.id,
          mau_sac: (bt.mau_sac || "").substring(0, 100),
          gia: gia >= 0 ? gia : 0,
          so_luong,
          hinh: (bt.hinh || "").substring(0, 255),
          hinh_phu1: (bt.hinh_phu1 || "").substring(0, 255),
          hinh_phu2: (bt.hinh_phu2 || "").substring(0, 255),
          hinh_phu3: (bt.hinh_phu3 || "").substring(0, 255),
          ghi_chu: (bt.ghi_chu || "").substring(0, 255),
        };
      });

      await BienTheSanPhamModel.bulkCreate(bienTheData);
    }

    // tra ve luon san pham vua tao (neu muon co ca bien the thi co the include)
    const productWithRelations = await PhuTungXeModel.findByPk(
      product.ma_san_pham || product.id,
      {
        include: [
          { model: LoaiXeModel, attributes: ["ten_loai"], required: false },
          { model: BienTheSanPhamModel, required: false },
        ],
      }
    );

    const json = productWithRelations
      ? productWithRelations.toJSON()
      : product.toJSON
      ? product.toJSON()
      : product;

    if (!Array.isArray(json.bien_the_san_phams)) {
      json.bien_the_san_phams = [];
    }

    console.log("✅ Tao san pham OK:", json.ma_san_pham || json.id);
    return res.status(201).json(json);
  } catch (err) {
    console.error("❌ Loi tao san pham:", err);
    return res.status(500).json({
      message: "Loi server!",
      error: err.message,
    });
  }
});

// PUT /api/admin/products/:id - Cập nhật sản phẩm
app.put("/api/admin/products/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ten_san_pham, mo_ta, id_loai_xe, an_hien, bien_the } = req.body;
    const product = await PhuTungXeModel.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }
    
    const updateData = {};
    if (ten_san_pham !== undefined) updateData.ten_san_pham = ten_san_pham;
    if (mo_ta !== undefined) updateData.mo_ta = mo_ta;
    if (id_loai_xe !== undefined) {
      // Kiểm tra loại xe có tồn tại không
      const loaiXe = await LoaiXeModel.findByPk(id_loai_xe);
      if (!loaiXe) {
        return res.status(400).json({ message: 'Loại xe không tồn tại!' });
      }
      updateData.id_loai_xe = Number(id_loai_xe);
    }
    if (an_hien !== undefined) updateData.an_hien = Number(an_hien);
    
    await product.update(updateData);
    
      // Cập nhật biến thể nếu có
      if (bien_the && Array.isArray(bien_the) && bien_the.length > 0) {
        // Xóa biến thể cũ
        await BienTheSanPhamModel.destroy({ where: { ma_san_pham: id } });
        // Tạo biến thể mới
       const bienTheData = bien_the.map((bt) => ({
  ma_san_pham: id,
  mau_sac: bt.mau_sac || "",
  gia: bt.gia || 0,
  so_luong: bt.so_luong || 0,
  hinh: bt.hinh || "",
  hinh_phu1: bt.hinh_phu1 || "",
  hinh_phu2: bt.hinh_phu2 || "",
  hinh_phu3: bt.hinh_phu3 || "",
  ghi_chu: bt.ghi_chu || "",
}));

        await BienTheSanPhamModel.bulkCreate(bienTheData);
      }
    const updatedProduct = await PhuTungXeModel.findByPk(id, {
      include: [
        { model: LoaiXeModel, attributes: ["ten_loai"] },
        { model: BienTheSanPhamModel },
      ],
    });
    res.json(updatedProduct);
  } catch (err) {
    console.error('Lỗi cập nhật sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// DELETE /api/admin/products/:id - Xóa sản phẩm
app.delete("/api/admin/products/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await PhuTungXeModel.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }
    // Xóa biến thể trước
    await BienTheSanPhamModel.destroy({ where: { ma_san_pham: id } });
    // Xóa sản phẩm
    await product.destroy();
    res.json({ message: 'Xóa sản phẩm thành công!' });
  } catch (err) {
    console.error('Lỗi xóa sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// GET /api/admin/orders - Lấy danh sách đơn hàng (admin)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await DonHangModel.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: ChiTietDonHangModel,
          as: "chi_tiet",
          include: [
            {
              model: PhuTungXeModel,
            },
          ],
        },
      ],
    });

    const mapped = orders.map((order) => {
      const o = order.toJSON();
      const chiTiet = Array.isArray(o.chi_tiet) ? o.chi_tiet : [];

      // ---- TÍNH TỔNG TIỀN ----
      const tong_tien = chiTiet.reduce((sum, ct) => {
        const qty = Number(ct.so_luong ?? 1);
        const price =
          Number(ct.thanh_tien) ||
          Number(ct.don_gia ?? ct.gia ?? 0) * qty;

        return sum + price;
      }, 0);

      // ---- TÍNH TỔNG SỐ LƯỢNG ----
      const tong_so_luong = chiTiet.reduce(
        (sum, ct) => sum + Number(ct.so_luong ?? 0),
        0
      );

      return {
        ...o,
        tong_tien,
        tong_so_luong,   // 👈 THÊM VÀO ĐÂY
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error("🔥 Lỗi /api/admin/orders:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
});

// PUT /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
app.put("/api/admin/orders/:id/status", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await DonHangModel.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
    }
    await order.update({ status });
    res.json(order);
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});


// GET /api/admin/users - Lấy danh sách users (admin)
app.get("/api/admin/users", checkAdmin, async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'email', 'ho_ten', 'vai_tro', 'dia_chi', 'dien_thoai'], // ❌ bỏ createdAt
      order: [["id", "DESC"]],
    });
    // Map dữ liệu để phù hợp với format trong frontend
    const mappedUsers = users.map((user) => ({
      id: user.id.toString(),
      ho_ten: user.ho_ten || '',
      email: user.email || '',
      vai_tro: user.vai_tro || 0,
      // Map trạng thái theo cột 'khoa' trong DB: 0 = active, 1 = locked
      trang_thai: user.khoa ? 'locked' : 'active',
    }));
    res.json(mappedUsers);
  } catch (err) {
    console.error('Lỗi lấy danh sách users admin:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// PUT /api/admin/users/:id/role - Cập nhật vai trò user
app.put("/api/admin/users/:id/role", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { vai_tro } = req.body;
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    }
    await user.update({ vai_tro });
    res.json(user);
  } catch (err) {
    console.error('Lỗi cập nhật vai trò user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// PUT /api/admin/users/:id/status - Cập nhật trạng thái user
app.put("/api/admin/users/:id/status", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body; // 'active' hoặc 'locked'

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    }

    // Map trạng_thái từ frontend sang cột 'khoa' trong DB
    const khoa = trang_thai === 'locked'; // locked = true, active = false

    await user.update({ khoa });

    // Trả về dữ liệu đúng format mà Admin đang dùng
    res.json({
      id: user.id.toString(),
      ho_ten: user.ho_ten || '',
      email: user.email || '',
      vai_tro: user.vai_tro || 0,
      trang_thai: khoa ? 'locked' : 'active',
    });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

app.get("/api/admin/comments", async (req, res) => {
  try {
    const comments = await BinhLuan.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "ho_ten", "email"],
        },
        {
          model: PhuTungXeModel,
          as: "product",
          attributes: ["ma_san_pham", "ten_san_pham"],
        },
      ],
      order: [["ngay_tao", "DESC"]],
    });

    res.json(comments);
  } catch (err) {
    console.error("❌ Lỗi API /admin/comments:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

app.put("/api/admin/comments/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body; // 0 = hiện, 1 = ẩn

    if (typeof trang_thai !== "number" || ![0, 1].includes(trang_thai)) {
      return res.status(400).json({ message: "Giá trị trạng_thai không hợp lệ!" });
    }

    // Lấy bình luận
    const cmt = await BinhLuan.findByPk(id);
    if (!cmt) {
      return res.status(404).json({ message: "Không tìm thấy bình luận!" });
    }

    // Cập nhật trạng thái
    cmt.trang_thai = trang_thai;
    await cmt.save();

    res.json({
      message: "Cập nhật trạng thái thành công!",
      id: cmt.id,
      trang_thai: cmt.trang_thai,
    });

  } catch (err) {
    console.error("❌ Lỗi cập nhật trạng thái bình luận:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
});



// GET /api/admin/settings - Lấy settings
app.get("/api/admin/settings", checkAdmin, async (req, res) => {
  try {
    // Có thể lưu settings trong database hoặc file
    // Hiện tại trả về default settings
    const settings = {
      shopName: 'GearX',
      shopEmail: 'support@example.com',
      shopPhone: '0123456789',
      shopAddress: 'Hà Nội',
      shippingFee: 30000,
      codEnabled: true,
      vnpayEnabled: false,
    };
    res.json(settings);
  } catch (err) {
    console.error('Lỗi lấy settings:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// PUT /api/admin/settings - Cập nhật settings
app.put("/api/admin/settings", checkAdmin, async (req, res) => {
  try {
    // Có thể lưu settings trong database sau
    // Hiện tại chỉ trả về data đã nhận
    const settings = req.body;
    res.json(settings);
  } catch (err) {
    console.error('Lỗi cập nhật settings:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});






app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
//Đây là API Route kiểu Express + Sequelize