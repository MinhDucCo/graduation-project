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
const { sendVerificationEmail } = require("./utils/sendEmail.js");
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
const port = 3000;
app.use(express.json());
app.use(cors());
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
app.get("/api/cart/:id_user", async (req, res) => {
  try {
    const id_user = req.params.id_user;
    console.log("🧠 Đang lấy giỏ hàng cho user:", id_user);

    const cart = await GioHangModel.findAll({ where: { id_user } });
    console.log("✅ Kết quả:", cart.length, "sản phẩm");
    res.json(cart);
  } catch (err) {
    console.error("🚨 Lỗi khi lấy giỏ hàng:", err);
    res.status(500).json({ message: "Không thể lấy giỏ hàng", error: err.message });
  }
});

// 🛒 API thêm sản phẩm vào giỏ hàng
app.post("/api/cart/add", async (req, res) => {
  try {
    const { ten_san_pham, gia, id_user, id_san_pham, so_luong, hinh, mau_sac } = req.body;

    if (!ten_san_pham || !gia || !id_user || !id_san_pham || !so_luong) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc!" });
    }

    const newCartItem = await GioHangModel.create({
      ten_san_pham,
      gia,
      id_user,
      id_san_pham,
      so_luong,
      hinh,
      mau_sac,
    });

    res.status(201).json({
      message: "Đã thêm vào giỏ hàng thành công!",
      data: newCartItem,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm giỏ hàng:", err);
    res.status(500).json({ message: "Không thể thêm giỏ hàng!", error: err.message });
  }
});


// Lấy toàn bộ giỏ hàng
app.get("/api/cart", async (req, res) => {
  try {
    const cart = await GioHangModel.findAll(); // sẽ tìm đúng bảng 'gio_hang'
    res.json(cart);
  } catch (err) {
    console.error("🚨 Lỗi khi lấy giỏ hàng:", err);
    res.status(500).json({ message: "Không thể lấy giỏ hàng", error: err.message });
  }
});



// 🗑️ Xóa sản phẩm khỏi giỏ
app.delete("/api/cart/delete/:id", async (req, res) => {
  try {
    await GioHangModel.destroy({ where: { id: req.params.id } });
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa", error: err.message });
  }
});
// Cập nhật số lượng sản phẩm trong giỏ
app.put("/api/cart/update/:id", async (req, res) => {
  try {
    const { so_luong } = req.body;
    await GioHangModel.update({ so_luong }, { where: { id: req.params.id } });
    res.json({ message: "Cập nhật số lượng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

// API đăng nhập
// app.post("/api/auth/login", async (req, res) => {
//   const { email, mat_khau } = req.body;

//   if (!email || !mat_khau) {
//     return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });
//   }

//   try {
//     const user = await Users.findOne({ where: { email } });
//     if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

//     const match = await bcrypt.compare(mat_khau, user.mat_khau);
//     if (!match) return res.status(400).json({ message: "Sai mật khẩu!" });

//     const token = jwt.sign({ id: user.id, email: user.email, vai_tro: user.vai_tro }, "MY_SECRET_KEY", { expiresIn: "1d" });

//     const userData = {
//       id: user.id,
//       email: user.email,
//       ho_ten: user.ho_ten,
//       vai_tro: user.vai_tro,
//       token,
//     };

//     res.json({
//       message: "Đăng nhập thành công!",
//       user: userData,
//     });
//   } catch (err) {
//     console.error("Lỗi đăng nhập:", err);
//     res.status(500).json({ message: "Lỗi server!" });
//   }
// });

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
    let match = false;

    // 🧩 Nếu mật khẩu trong DB bắt đầu bằng "$2b$", nghĩa là đã được bcrypt hash
    if (user.mat_khau.startsWith("$2b$")) {
      match = await bcrypt.compare(mat_khau, user.mat_khau);
    } else {
      // 🧩 Ngược lại, so sánh trực tiếp (dành cho mật khẩu lưu thẳng, không mã hóa)
      match = mat_khau === user.mat_khau;
    }

    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu!" });
    }

    // ✅ Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, vai_tro: user.vai_tro },
      "MY_SECRET_KEY",
      { expiresIn: "1d" }
    );

    // ✅ Trả thông tin user về client
    const userData = {
      id: user.id,
      email: user.email,
      ho_ten: user.ho_ten,
      vai_tro: user.vai_tro,
      token,
    };

    return res.json({
      message: "Đăng nhập thành công!",
      user: userData,
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