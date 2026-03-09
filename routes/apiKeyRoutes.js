const express = require("express");
const router = express.Router();

const apiKeyController = require("../controllers/apiKeyController");
const { verifyToken } = require("../middleware/middleware");

router.post("/create", verifyToken, apiKeyController.createApiKey);
router.get("/list", verifyToken, apiKeyController.getApiKeys);
router.put("/change-name", verifyToken, apiKeyController.changeName);
router.put("/regenerate", verifyToken, apiKeyController.regenerateKey);
router.delete("/delete", verifyToken, apiKeyController.deleteKey);

console.log(apiKeyController,'sssss3');
module.exports = router;