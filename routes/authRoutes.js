const express = require("express");

const router = express.Router();
const nodemailer = require("nodemailer");

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
// ye sb protected he 
router.post("/change-password", verifyToken, authController.changePassword);
router.delete("/delete-account", verifyToken, authController.deleteAccount);
router.put(
    "/change-email",
    verifyToken,
    authController.changeEmail
);

router.get("/verify-email", authController.verifyEmail);
module.exports = router;