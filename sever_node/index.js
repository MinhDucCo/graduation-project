/**
 * @typedef {import('./database.js')} DB
 */
/** @type {DB} */
const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const session = require("express-session");
const { sendVerificationEmail } = require("./utils/sendEmail.js");
const { readJson, writeJson } = require('./utils/fileStore.js');
const {
  sequelize,
  Users,
  PhuTungXeModel,
  LoaiXeModel,
  BienTheSanPhamModel,
  GioHangModel,
  LienHeModel,
} = require("./database.js");
const app = express();
app.set('trust proxy', 1);
app.use(
  session({
    name: 'sid',
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
      sameSite: 'lax',
      secure: false,
    },
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
app.use(express.static("public"));
// Session helper endpoints and admin guard
function requireAdmin(req, res, next) {
  try {
    const user = req.session && req.session.user;
    const role = user?.vai_tro;
    const isAdmin = role === 'admin' || role === 'ADMIN' || role === 1 || role === '1';
    if (!user || !isAdmin) {
      return res.status(403).json({ message: 'Yêu cầu quyền quản trị' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Không thể xác thực' });
  }
}

app.get('/api/auth/me', (req, res) => {
  try {
    const user = req.session && req.session.user;
    res.json({ user: user || null });
  } catch (e) {
    res.json({ user: null });
  }
});
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



// Lấy tất cả sản phẩm có an_hien = 2 Là Xe máy
// app.get("/api/san_pham/an_hien_2", async (req, res) => {
//   try {
//     const sp_arr = await PhuTungXeModel.findAll({
//       where: { an_hien: 2 },
//       order: [["gia", "ASC"]], // sắp xếp theo giá tăng dần
//       include: [
//         {
//           model: LoaiXeModel,
//           attributes: ["ten_loai"], // lấy tên loại xe
//         },
//       ],
//     });

//     res.json(sp_arr);
//   } catch (error) {
//     console.error("Lỗi khi lấy sản phẩm:", error);
//     res.status(500).json({ message: "Lỗi server", error: error.message });
//   }
// });


app.get("/api/san_pham/an_hien_2", async (req, res) => {
  try {
    // Lấy page & limit từ query, có mặc định
    let page = parseInt(req.query.page) || 1; // trang hiện tại
    let limit = parseInt(req.query.limit) || 8; // số sản phẩm mỗi trang
    let offset = (page - 1) * limit;

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
      order: [[BienTheSanPhamModel, "gia", "ASC"]], // ✅ sắp xếp theo giá ở bảng biến thể
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
    // Lấy query page & limit từ client
    let page = parseInt(req.query.page) || 1; // trang hiện tại
    let limit = parseInt(req.query.limit) || 8; // số sản phẩm mỗi trang
    let offset = (page - 1) * limit;

    // Đếm tổng số sản phẩm để tính totalPages
    const totalItems = await PhuTungXeModel.count({ where: { an_hien: 3 } });
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy danh sách sản phẩm có phân trang
    const sp_arr = await PhuTungXeModel.findAll({
      where: { an_hien: 3 },
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
      order: [[BienTheSanPhamModel, "gia", "ASC"]], // ✅ sắp xếp theo giá của bảng biến thể
      limit: limit,
      offset: offset,
    });

    res.json({
      data: sp_arr,
      pagination: {
        totalItems,
        page,
        limit,
        totalPages,
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



// 🛒 Lấy giỏ hàng theo ID người dùng
// app.get("/api/cart/:id_user", async (req, res) => {
//   try {
//     const id_user = req.params.id_user;
//     console.log("🧠 Đang lấy giỏ hàng cho user:", id_user);

//     const cart = await GioHangModel.findAll({ where: { id_user } });
//     console.log("✅ Kết quả:", cart.length, "sản phẩm");
//     res.json(cart);
//   } catch (err) {
//     console.error("🚨 Lỗi khi lấy giỏ hàng:", err);
//     res.status(500).json({ message: "Không thể lấy giỏ hàng", error: err.message });
//   }
// });

app.get("/api/cart", async (req, res) => {
  const { id_user } = req.query;
  console.log("📥 API GET /api/cart - id_user:", id_user);

  try {
    if (id_user) {
      const cart = await GioHangModel.findAll({ where: { id_user } });
      console.log("✅ Dữ liệu giỏ hàng từ DB:", JSON.stringify(cart, null, 2)); // 👈 In rõ
      return res.json(cart.map(c => c.toJSON())); // ép về plain object
    } else {
      console.log("🧾 Giỏ hàng session:", req.session.cart);
      return res.json(req.session.cart || []);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể lấy giỏ hàng" });
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
app.get("/api/cart", async (req, res) => {
  const { id_user } = req.query;

  try {
    if (id_user) {
      // 🧾 Đã đăng nhập → lấy DB
      const cart = await GioHangModel.findAll({ where: { id_user } });
      return res.json(cart);
    } else {
      // 🚫 Chưa đăng nhập → lấy session
      return res.json(req.session.cart || []);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể lấy giỏ hàng" });
  }
});

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


// Cập nhật số lượng sản phẩm trong giỏ
app.put("/api/cart/update/:id", async (req, res) => {
  const { so_luong } = req.body;
  const { id } = req.params;

  try {
    await GioHangModel.update({ so_luong }, { where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cập nhật số lượng thất bại" });
  }
});
//Khi người dùng đăng nhập mà trước đó có session giỏ hàng, gộp giỏ hàng session vào giỏ hàng DB
// app.post("/api/cart/merge-session", async (req, res) => {
//   const { id_user } = req.body;
//   const cartSession = req.session.cart || [];

//   try {
//     for (const item of cartSession) {
//       await GioHangModel.create({
//         id_user,
//         ...item,
//       });
//     }
//     req.session.cart = []; // clear session sau khi gộp
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Gộp giỏ hàng thất bại" });
//   }
// });

// API đăng nhập


app.post("/api/auth/login", async (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });
  }

  try {
    // 🔍 Tìm user trong DB
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    // 🧩 Kiểm tra mật khẩu (bcrypt hoặc plain text)
    let match = false;
    if (user.mat_khau.startsWith("$2b$")) {
      match = await bcrypt.compare(mat_khau, user.mat_khau);
    } else {
      match = mat_khau === user.mat_khau;
    }

    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu!" });
    }

    // 🔐 Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, vai_tro: user.vai_tro },
      "MY_SECRET_KEY",
      { expiresIn: "1d" }
    );

    // 📦 Lưu thông tin user vào session
    req.session.user = {
      id: user.id,
      email: user.email,
      ho_ten: user.ho_ten,
      vai_tro: user.vai_tro,
    };

    console.log("✅ Session user sau khi đăng nhập:", req.session.user);

    // 🧩 GỘP GIỎ HÀNG SESSION VÀO DATABASE
    if (req.session.cart && req.session.cart.length > 0) {
      console.log("🛒 Gộp giỏ hàng session vào DB cho user:", user.id);

      for (const item of req.session.cart) {
        // Kiểm tra xem sản phẩm này đã có trong DB chưa
        const existing = await GioHangModel.findOne({
          where: {
            id_user: user.id,
            id_san_pham: item.id_san_pham,
            mau_sac: item.mau_sac,
          },
        });

        if (existing) {
          // Nếu có rồi → cộng dồn số lượng
          await existing.update({
            so_luong: existing.so_luong + item.so_luong,
          });
        } else {
          // Nếu chưa có → thêm mới vào DB
          await GioHangModel.create({
            ten_san_pham: item.ten_san_pham,
            gia: item.gia,
            id_user: user.id,
            id_san_pham: item.id_san_pham,
            so_luong: item.so_luong,
            hinh: item.hinh,
            mau_sac: item.mau_sac,
            ngay_them: new Date(),
          });
        }
      }

      // ✅ Sau khi gộp xong thì xóa session giỏ hàng tạm
      req.session.cart = [];
      console.log("🧹 Đã xóa giỏ hàng session sau khi gộp!");
    }

    // ✅ Trả về dữ liệu user cho frontend
    return res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
        token, // (nếu bạn muốn dùng ở frontend)
      },
    });

  } catch (err) {
    console.error("🔥 Lỗi đăng nhập:", err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
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
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin!" });
  }

  try {
    // Tìm user có email và OTP hợp lệ
    const user = await Users.findOne({
      where: {
        email,
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





app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});

// -------------------- Admin product CRUD (simple) --------------------
// Lưu ý: endpoints này dùng để admin quản lý sản phẩm (create/update/delete)
app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const products = await PhuTungXeModel.findAll({
      include: [LoaiXeModel, BienTheSanPhamModel],
      order: [['ma_san_pham', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    console.error('Lỗi lấy admin products:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const { ma_san_pham, ten_san_pham, id_loai_xe, mo_ta, an_hien, bien_the } = req.body;
    // Nếu không có ma_san_pham, tạo mã ngẫu nhiên
    const code = ma_san_pham || Math.random().toString(36).slice(2, 9).toUpperCase();
    const product = await PhuTungXeModel.create({ ma_san_pham: code, ten_san_pham, id_loai_xe, mo_ta, an_hien });

    // Tạo biến thể nếu có
    if (Array.isArray(bien_the)) {
      for (const b of bien_the) {
        await BienTheSanPhamModel.create({ ma_san_pham: code, mau_sac: b.mau_sac || null, gia: b.gia || 0, so_luong: b.so_luong || 0, hinh: b.hinh || null });
      }
    }

    const created = await PhuTungXeModel.findOne({ where: { ma_san_pham: code }, include: [BienTheSanPhamModel] });
    res.json(created);
  } catch (err) {
    console.error('Lỗi tạo sản phẩm admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/admin/products/:ma_san_pham', requireAdmin, async (req, res) => {
  try {
    const { ma_san_pham } = req.params;
    const { ten_san_pham, id_loai_xe, mo_ta, an_hien, bien_the } = req.body;

    await PhuTungXeModel.update({ ten_san_pham, id_loai_xe, mo_ta, an_hien }, { where: { ma_san_pham } });

    if (Array.isArray(bien_the)) {
      // Đơn giản: xóa các biến thể cũ và tạo lại
      await BienTheSanPhamModel.destroy({ where: { ma_san_pham } });
      for (const b of bien_the) {
        await BienTheSanPhamModel.create({ ma_san_pham, mau_sac: b.mau_sac || null, gia: b.gia || 0, so_luong: b.so_luong || 0, hinh: b.hinh || null });
      }
    }

    const updated = await PhuTungXeModel.findOne({ where: { ma_san_pham }, include: [BienTheSanPhamModel] });
    res.json(updated);
  } catch (err) {
    console.error('Lỗi cập nhật sản phẩm admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/admin/products/:ma_san_pham', requireAdmin, async (req, res) => {
  try {
    const { ma_san_pham } = req.params;
    await BienTheSanPhamModel.destroy({ where: { ma_san_pham } });
    await PhuTungXeModel.destroy({ where: { ma_san_pham } });
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi xóa sản phẩm admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// -------------------- Admin users --------------------
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await Users.findAll({ attributes: ['id', 'ho_ten', 'email', 'vai_tro', 'trang_thai'] });
    res.json(users.map(u => ({
      id: u.id,
      ho_ten: u.ho_ten,
      email: u.email,
      vai_tro: u.vai_tro,
      trang_thai: u.trang_thai || 'active',
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { vai_tro } = req.body;
    await Users.update({ vai_tro }, { where: { id } });
    const user = await Users.findByPk(id, { attributes: ['id', 'ho_ten', 'email', 'vai_tro', 'trang_thai'] });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({});
  }
});

app.put('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;
    await Users.update({ trang_thai }, { where: { id } });
    const user = await Users.findByPk(id, { attributes: ['id', 'ho_ten', 'email', 'vai_tro', 'trang_thai'] });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({});
  }
});

// -------------------- Admin settings (file-backed) --------------------
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const data = readJson('settings.json', null);
  res.json(data || {});
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const body = req.body || {};
  writeJson('settings.json', body);
  res.json(body);
});

// -------------------- Admin orders (file-backed) --------------------
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const list = readJson('orders.json', []);
  res.json(list);
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const list = readJson('orders.json', []);
  const idx = list.findIndex(o => String(o.id) === String(id));
  if (idx === -1) return res.status(404).json({ message: 'Order not found' });
  list[idx].status = status;
  writeJson('orders.json', list);
  res.json(list[idx]);
});

// -------------------- Admin stats (computed from orders file) --------------------
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const { from, to } = req.query;
  const orders = readJson('orders.json', []);
  const inRange = orders.filter(o => {
    if (!from || !to) return true;
    const d = new Date(o.createdAt).toISOString().slice(0,10);
    return d >= from && d <= to;
  });
  const revenueTotal = inRange.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const ordersTotal = inRange.length;
  const ordersByStatus = {};
  const salesByDate = {};
  for (const o of inRange) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    const d = new Date(o.createdAt).toISOString().slice(0,10);
    salesByDate[d] = (salesByDate[d] || 0) + (Number(o.total) || 0);
  }
  const salesArr = Object.entries(salesByDate).map(([date, total]) => ({ date, total })).sort((a,b)=>a.date.localeCompare(b.date));
  res.json({ revenueTotal, ordersTotal, ordersByStatus, topProducts: [], salesByDate: salesArr });
});
