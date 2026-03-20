const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { verifyToken } = require("../middleware/middleware");
router.post("/activity-logs", verifyToken,activityController.getActivityLogs);

module.exports = router;