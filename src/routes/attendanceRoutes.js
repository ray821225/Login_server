const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  clock,
  clockByCredentials,
  getToday,
  getHistory,
} = require("../controllers/attendanceController");

// 需要認證
router.post("/clock", protect, clock);
router.get("/today", protect, getToday);
router.get("/history", protect, getHistory);

// 公用裝置打卡（透過帳密驗證）
router.post("/clock-by-credentials", clockByCredentials);

module.exports = router;
