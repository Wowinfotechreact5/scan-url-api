require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const apiKeyIpRoutes = require("./routes/apiKeyIpRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/apikey", apiKeyRoutes);

app.use("/api/apikey-ip", apiKeyIpRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
});