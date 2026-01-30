const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 生成 JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// 註冊
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 驗證輸入
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "請提供使用者名稱、電子郵件和密碼",
      });
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "請提供有效的電子郵件地址",
      });
    }

    // 檢查使用者是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        message: "使用者名稱或電子郵件已被使用",
      });
    }

    // 創建新使用者
    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "註冊成功",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // 處理 MongoDB 驗證錯誤
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      message: "註冊失敗，請稍後再試",
      error: error.message,
    });
  }
};

// 登入
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 驗證輸入
    if (!email || !password) {
      return res.status(400).json({
        message: "請提供電子郵件和密碼",
      });
    }

    // 檢查使用者並包含密碼欄位
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "電子郵件或密碼錯誤",
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "電子郵件或密碼錯誤",
      });
    }

    // 更新最後登入時間
    user.lastLogin = Date.now();
    await user.save();

    // 生成 token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      detail: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "登入失敗",
      error: error.message,
    });
  }
};

// 獲取當前使用者資訊
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "獲取使用者資訊失敗",
      error: error.message,
    });
  }
};
