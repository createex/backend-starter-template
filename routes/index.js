const router = require("express").Router();
const userhRouter = require("./authRoutes");
const userProfileRouter = require("./userProfileRoutes");

router.use("/auth", userhRouter).use("/user", userProfileRouter);
module.exports = router;
