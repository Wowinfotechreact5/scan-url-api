const express = require("express");
const router = express.Router();
const controller = require("../controllers/walletController");
const { verifyToken } = require("../middleware/middleware");

router.get("/wallet",verifyToken,controller.getWallet);

module.exports = router;