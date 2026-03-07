const express = require("express");

const router = express.Router();

const { register, login,changePassword } = require("../controllers/authController");

//register ki api
router.post("/register", register);

//login ki api
router.post("/login", login);

//change password ki api 
// console.log('abc');

router.post("/change-password", changePassword)

module.exports = router;