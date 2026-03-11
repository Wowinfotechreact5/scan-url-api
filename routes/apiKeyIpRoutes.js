const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/middleware");
const ipController = require("../controllers/apiKeyIpController");

router.post("/add", verifyToken, ipController.addIp);

router.get("/list/:apiKeyId", verifyToken, ipController.getIps);

router.delete("/delete", verifyToken, ipController.deleteIp);

module.exports = router;