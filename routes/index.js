const router = require("express").Router();
const userRouter = require("../routes/auth/authRoutes");
const userProfileRouter = require("../routes/user/userProfileRoutes");

router.use("/auth", userRouter).use("/user", userProfileRouter);
module.exports = router;
