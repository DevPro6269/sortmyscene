const express = require("express");
const { listEvents, getEvent } = require("../controllers/eventController");

const router = express.Router();
router.get("/", listEvents);
router.get("/:id", getEvent);

module.exports = router;
