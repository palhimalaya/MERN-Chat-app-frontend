const { protect } = require("../middleware/authMiddleware");

const express = require("express");
const {
  sendMessage,
  allMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessage);

module.exports = router;
