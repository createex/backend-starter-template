const { authSchema } = require("../utils/schema");
const { get4DigitCode } = require("../utils/otpGenerator");
const generateToken = require("../utils/jwtToken");
// const userId = require("../utils/userId")
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

module.exports.register = async (Model, userInfo, res) => {
  try {
    const { email, password, name, username } = userInfo;
    const result = await authSchema.validate(userInfo);
    if (!result) {
      return res.status(400).json({ message: "Invalid request body" });
    }
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists against this email" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code = get4DigitCode();
    const userId = Math.floor(10000000 + Math.random() * 90000000);
    const newUser = new Model({
      name,
      email,
      username,
      emailOtp: code,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();
    // await sendVerificationEmail(email, code);

    res.status(201).json({
      message: "User created successfully",
      newUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to register user",
      error: error.message,
    });
  }
};

module.exports.login = async (Model, userInfo, res) => {
  const { email, password } = userInfo;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "email, password is required" });
    }

    let query = Model.findOne({ email });
    const user = await query;

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found against this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    if (!user.isVerified) {
      const code = get4DigitCode();
      user.emailOtp = code;
      await user.save();
      await sendVerificationEmail(email, code);
      return res.status(401).json({ message: "User not verified", code });
    }

    if (!user.approvedByAdmin && user.profileCompleted) {
      return res.status(403).json({
        message: "Your account is in the review process by the administrator.",
      });
    }

    const token = generateToken(user._id);

    let responseData = {
      message: "User logged in successfully",
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvedByAdmin: user.approvedByAdmin,
        profileCompleted: user.profileCompleted,
        token,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(400).json({
      message: "Failed to login",
      error: error.message,
    });
  }
};

module.exports.sendCode = async (Model, userInfo, res) => {
  try {
    const { email } = userInfo;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email is not existing" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const code = get4DigitCode();
    user.emailOtp = code;
    await user.save();
    await sendVerificationEmail(email, code);

    return res
      .status(200)
      .json({ status: true, message: "Successfully send verification code" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send verification code",
      error: error.message,
    });
  }
};

module.exports.verifyCode = async (Model, userInfo, res) => {
  try {
    const { email, otp } = userInfo;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and otp are required.",
      });
    }
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }
    // if (user.isVerified) {
    //   return res.status(400).json({
    //     message: "User already verified.",
    //   });
    // }
    if (user.emailOtp !== Number(otp.toString())) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.emailOtp = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User verified successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify code",
      error: error.message,
    });
  }
};

module.exports.forgetPasswordOtp = async (Model, userInfo, res) => {
  try {
    const { email } = userInfo;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email is not existing" });
    }

    const code = get4DigitCode();
    user.passwordOtp = code;
    await user.save();
    await sendVerificationEmail(email, code);

    return res.status(200).json({
      status: true,
      message: "Verification code sent check your Email",
      data: { email, code },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

//verify forget password otp
module.exports.verifyForgetPasswordOtp = async (Model, userInfo, res) => {
  try {
    const { email, otp } = userInfo;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and otp are required.",
      });
    }
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }
    if (user.passwordOtp !== Number(otp.toString())) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "otp verified successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify password reset OTP",
      error: error.message,
    });
  }
};

module.exports.newPassword = async (Model, userInfo, req, res) => {
  try {
    const userId = req.user._id;
    const { password } = userInfo;
    if (!password) {
      return res.status(400).json({ message: "please provide password" });
    }
    const user = await Model.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "User is not verified" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    const token = generateToken(user._id);
    let responseData = {
      message: "Password updated successfully",
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        token,
      },
    };
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to set new password",
      error: error.message,
    });
  }
};

module.exports.changePassword = async (Model, userInfo, res) => {
  try {
    const { email, oldPassword, newPassword } = userInfo;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, old password and new password are required.",
      });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user not find against this email" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "old password is not correct" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // creating a token
    const token = generateToken(user._id);

    return res.status(200).json({
      status: true,
      token: token,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};
