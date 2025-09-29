const express = require("express");
const helmet = require("helmet");
const app = express();
const port = 3000;
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "http://localhost:3000"],
    imgSrc: ["'self'", "data:", "https://example.com"], // Cho phép tải ảnh từ URL
  },
}));
app.use(express.static('public')); // Phục vụ file tĩnh từ thư mục public
const { sequelize, LoaiXeModel, PhuTungXeModel, } = require("./database");
const { Op } = require("sequelize");
app.get("/", (req, res) => {
  res.send(`
    <h1>API Phụ tùng xe</h1>
    <p>Truy cập các API:</p>
    <ul>
      <li><a href="/api/loai_xe/1">/api/loai_xe/1</a> - Lấy thông tin loại xe</li>
      <li><a href="/api/phu_tung_xe">/api/phu_tung_xe</a> - Lấy danh sách phụ tùng xe</li>
      <li><a href="/api/phu_tung/PT001">/api/phu_tung/PT001</a> - Xem chi tiết sản phẩm</li>
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
      where: {
        an_hien: 1
      },
      order: [['gia', 'ASC']],
      include: [{ model: LoaiXeModel, attributes: ['ten_loai'] }],
    });
    res.json(sp_arr);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/sanpham/:ma_san_pham", async (req, res) => {
  const { ma_san_pham } = req.params;
  const sp = await PhuTungXeModel.findOne({ where: { ma_san_pham } });
  if (!sp) return res.status(404).json({ message: "Không tìm thấy" });
  res.json(sp);
});

// app.get("/api/tim_kiem/:tu_khoa/:page", async (req, res) => {
//     let tu_khoa = req.params.tu_khoa;
//     const page = Number(req.params.page) || 1;
//     const sp_arr = await PhuTungXeModel.findAll({
//         where: {
//             ten_san_pham: { [Op.substring]: tu_khoa }, // Sequelize tự hiểu là LIKE '%tu_khoa%'
//             an_hien: 1
//         },
//         order: [['ngay', 'DESC'], ['gia', 'ASC']]
//     });
//     res.json(sp_arr);
// });

// API tìm kiếm
app.get('/api/timkiem/:tu_khoa/:page', async (req, res) => {
  const tu_khoa = req.params.tu_khoa || '';
  const page = Number(req.params.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;
  try {
    const sp_arr = await PhuTungXeModel.findAll({
     where: {
  ten_san_pham: { [Op.like]: `%${tu_khoa}%` }, // thay iLike thành like
  an_hien: 1,
      },
      order: [['gia', 'ASC']],
      limit: limit,
      offset: offset,
    });

    res.json(sp_arr); // Trả về trực tiếp, không cần ánh xạ
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

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});