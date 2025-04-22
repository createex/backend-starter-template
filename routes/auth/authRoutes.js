const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { userController } = require("../../controllers");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/verify", userController.verifyVerificationCode);
router.post("/forgetPassword", userController.forgetPasswordOtp);
router.post("/verifyForgetPasswordOtp", userController.verifyForgetPasswordOtp);
router.post("/newPassword", authMiddleware, userController.updatePassword);
router.post("/changePassword", userController.changePassword);

module.exports = router;
