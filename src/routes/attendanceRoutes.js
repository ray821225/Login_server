const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  clock,
  clockByCredentials,
  getToday,
  getHistory,
  getAllAttendance,
} = require("../controllers/attendanceController");

// 需要認證
router.post("/clock", protect, clock);
router.get("/today", protect, getToday);
router.get("/history", protect, getHistory);

// 需要 admin 權限
router.get("/admin/all", protect, isAdmin, getAllAttendance);

// 公用裝置打卡（透過帳密驗證）
router.post("/clock-by-credentials", clockByCredentials);

module.exports = router;
