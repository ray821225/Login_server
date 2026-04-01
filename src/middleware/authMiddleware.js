const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  // 從 header 獲取 token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 檢查 token 是否存在
  if (!token) {
    return res.status(401).json({
      message: "未授權，請先登入",
    });
  }

  try {
    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 獲取使用者資訊（包含 activeToken 用於比對）
    const user = await User.findById(decoded.id).select("+activeToken");

    if (!user) {
      return res.status(401).json({
        message: "找不到該使用者",
      });
    }

    // 檢查是否為最新的登入 token（單一裝置登入）
    if (user.activeToken && user.activeToken !== token) {
      return res.status(401).json({
        message: "帳號已在其他裝置登入",
        code: "SESSION_REPLACED",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token 無效或已過期",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "權限不足" });
  }
  next();
};
