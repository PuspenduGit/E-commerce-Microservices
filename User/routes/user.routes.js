const express = require("express");
const userController = require("../controllers/user.controller");
const userAuth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/profile", userAuth, userController.profile);

module.exports = router;
