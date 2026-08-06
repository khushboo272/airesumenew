const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = mongoose.connection.readyState;
    const isDbReady = dbState === 1; // 1 = connected

    const payload = {
        status: isDbReady ? "ok" : "degraded",
        uptime: process.uptime(),
        db: states[dbState] || "unknown",
        timestamp: new Date().toISOString(),
    };

    // Return 503 when DB is not connected so K8s readiness probe fails
    // This prevents routing traffic to pods that can't serve requests
    res.status(isDbReady ? 200 : 503).json(payload);
});

module.exports = router;