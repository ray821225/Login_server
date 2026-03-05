const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const qrRoutes = require('./routes/qrRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 連接資料庫（非阻塞）
connectDB().catch(err => {
  console.error('資料庫連接失敗，但伺服器將繼續運行');
});

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/qr', qrRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '伺服器運行正常' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '伺服器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
});

module.exports = app;
