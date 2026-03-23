const express = require("express");
const router = express.Router();

const apiKeyController = require("../controllers/apiKeyController");
const { verifyToken } = require("../middleware/middleware");

router.post("/create", verifyToken, apiKeyController.createApiKey);
router.get("/list", verifyToken, apiKeyController.getApiKeys);
router.put("/change-name", verifyToken, apiKeyController.changeName);
router.put("/regenerate", verifyToken, apiKeyController.regenerateKey);
router.delete("/delete", verifyToken, apiKeyController.deleteKey);
router.put("/set-credit", verifyToken, apiKeyController.setCreditLimit);
router.post("/v1/url-scan", apiKeyController.scanUrl);
router.get("/limit",verifyToken,apiKeyController.getApiKeyLimit);
module.exports = router;