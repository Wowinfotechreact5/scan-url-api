const express = require("express");
const router = express.Router();

const getApiUsageLogById = require("../controllers/apiUsageLogsController");

router.get("/api-usage-log/:id", getApiUsageLogById.getApiUsageLogById);

module.exports = router;   // <-- THIS LINE IS MISSING