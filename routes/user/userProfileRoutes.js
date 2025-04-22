const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { userController } = require("../../controllers");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/getProfile", userController.getProfile);
router.get("/getProfileById/:id", userController.getPrgetProfileById);
router.get("/show-me", userController.showMe);

module.exports = router;
