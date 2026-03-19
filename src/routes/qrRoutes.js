const express = require("express");
const router = express.Router();
const { generate, verify, getStatus } = require("../controllers/qrController");

router.get("/generate", generate);
router.post("/verify", verify);
router.get("/status/:token", getStatus);

module.exports = router;
