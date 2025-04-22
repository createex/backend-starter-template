const { get4DigitCode } = require("./otpGenerator");
const generateToken = require("./jwtToken");
const { validateUserRegistration } = require("./validation");

module.exports = {
  get4DigitCode,
  generateToken,
  validateUserRegistration,
};
