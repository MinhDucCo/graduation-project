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
const { sequelize, PhuTungXeModel, LoaiXeModel, BienTheSanPhamModel } = require("./database");

const { Op } = require("sequelize");
app.get("/", (req, res) => {
  res.send(`
    <h1>API Phụ tùng xe</h1>
    <p>Truy cập các API:</p>
    <ul>
      <li><a href="/api/loai_xe/1">/api/loai_xe/1</a> - Lấy thông tin loại xe</li>
      <li><a href="/api/phu_tung_xe">/api/phu_tung_xe</a> - Lấy danh sách phụ tùng xe</li>
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





// Lấy tất cả sản phẩm có an_hien = 3 là Ô TÔ
// app.get("/api/san_pham/an_hien_3", async (req, res) => {
//   try {
//     const sp_arr = await PhuTungXeModel.findAll({
//       where: { an_hien: 3 },
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


app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});