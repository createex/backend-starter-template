// validation.js
const { check, validationResult } = require("express-validator");

const validateUserRegistration = [
  check("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation Failed", errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateUserRegistration };
