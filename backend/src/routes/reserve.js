const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { reserve } = require("../controllers/reservationController");

const router = express.Router();
router.post("/", requireAuth, reserve);

module.exports = router;
