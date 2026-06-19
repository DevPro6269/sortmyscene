const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createBooking } = require("../controllers/bookingController");

const router = express.Router();
router.post("/", requireAuth, createBooking);

module.exports = router;
