const express = require("express");
const router = express.Router();
const { generate, verify } = require("../controllers/qrController");

router.get("/generate", generate);
router.post("/verify", verify);

module.exports = router;
