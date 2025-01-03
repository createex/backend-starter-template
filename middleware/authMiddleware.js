const jwt = require("jsonwebtoken");
const userCluster = require("../models/userModel");
require("dotenv").config();

module.exports.authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token.trim(), process.env.SECRET);

        req.user = await userCluster.findById(decoded.id);

        if (!req.user) {
          return res.status(403).json({ message: "Access denied" });
        }
        if (
          req.user.approvedByAdmin === "Pending" ||
          req.user.approvedByAdmin === "Rejected"
        ) {
          return res.status(403).json({
            message: "Access denied! account not approved by admin yet",
          });
        }
        next();
      } catch (error) {
        res.status(401).send("Not authorized, token failed");
      }
    }
    if (!token) {
      res.status(401).send({
        message: "you are not authorized, No token",
      });
    }
  } catch (error) {
    res.status(401).json({ message: "Authentication failed." });
  }
};
//authorize permission for admin
module.exports.authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }
    console.log(req.user.role);

    next();
  };
};
