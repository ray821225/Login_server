const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // 從 header 獲取 token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 檢查 token 是否存在
  if (!token) {
    return res.status(401).json({
      message: '未授權，請先登入'
    });
  }

  try {
    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 獲取使用者資訊
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        message: '找不到該使用者'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token 無效或已過期'
    });
  }
};
