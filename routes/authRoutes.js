const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// ye sb protected he 
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;