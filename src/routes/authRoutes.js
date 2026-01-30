const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 註冊路由
router.post(
  "/register",
  // [
  //   body('username').trim().isLength({ min: 3 }).withMessage('使用者名稱至少需要 3 個字元'),
  //   body('email').isEmail().withMessage('請提供有效的電子郵件'),
  //   body('password').isLength({ min: 6 }).withMessage('密碼至少需要 6 個字元')
  // ],
  register
);

// 登入路由
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("請提供有效的電子郵件"),
    body("password").notEmpty().withMessage("請提供密碼"),
  ],
  login
);

// 獲取當前使用者 (需要驗證)
router.get("/me", protect, getMe);

module.exports = router;
