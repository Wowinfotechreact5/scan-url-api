const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionController");
const { verifyToken } = require("../middleware/middleware");

router.get("/plans",controller.getPlans);

router.get("/my-plan",verifyToken,controller.getUserPlan);

router.post("/upgrade",verifyToken,controller.upgradePlan);
router.get("/details", verifyToken, controller.getSubscriptionDetails);
module.exports = router;