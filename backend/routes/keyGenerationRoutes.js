//generate rsa key pair
const express = require("express");
// const { protect } = require("../middleware/authMiddleware");
const {
  keyGeneration,
  encryptData,
  decryptData,
  generateECDHKeys,
} = require("../controllers/keyController");

const router = express.Router();
router.route("/generateKeyPair").get(keyGeneration);
router.route("/encryptData").post(encryptData);
router.route("/decryptData").post(decryptData);

module.exports = router;
