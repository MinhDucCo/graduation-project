const bcrypt = require("bcrypt");
const { Users } = require("./database.js");

(async () => {
  try {
    const hash = await bcrypt.hash("123456", 10);
    await Users.create({
      email: "admin@gmail.com",
      mat_khau: hash,
      ho_ten: "Admin",
      vai_tro: 1,
    });
    console.log("✅ Admin account created: admin@gmail.com / 123456");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  }
})();
