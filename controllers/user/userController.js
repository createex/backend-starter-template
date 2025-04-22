const { userCluster } = require("../../models");
const {
  register,
  login,
  verifyCode,
  sendCode,
  changePassword,
  forgetPasswordOtp,
  newPassword,
  verifyForgetPasswordOtp,
} = require("../auth/authController");

module.exports.registerUser = async (req, res) => {
  register(userCluster, req.body, res);
};

module.exports.loginUser = async (req, res) => {
  login(userCluster, req.body, res);
};

module.exports.sendVerificationCode = async (req, res) => {
  sendCode(userCluster, req.body, res);
};

module.exports.verifyVerificationCode = async (req, res) => {
  verifyCode(userCluster, req.body, res);
};

module.exports.forgetPasswordOtp = async (req, res) => {
  forgetPasswordOtp(userCluster, req.body, res);
};

module.exports.verifyForgetPasswordOtp = async (req, res) => {
  verifyForgetPasswordOtp(userCluster, req.body, res);
};

module.exports.updatePassword = async (req, res) => {
  newPassword(userCluster, req.body, req, res);
};

module.exports.changePassword = async (req, res) => {
  changePassword(userCluster, req.body, res);
};

///profile Apies///

exports.getPrgetProfileById = async (req, res) => {
  try {
    let getId = req.params.id;
    const getUser = await userCluster
      .findById(getId)
      .select("name userName email createdAt updatedAt");
    if (!getUser)
      return res.status(404).json({
        message: "user profile not found against this id",
      });
    else {
      res.status(200).json({
        message: "user profile found sucessfully!",
        data: getUser,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const getUser = await userCluster
      .find()
      .select("name userName email createdAt updatedAt");

    if (!getUser || getUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Profile found successfully!",
      data: getUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profiles", error: error.message });
  }
};

exports.showMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userCluster
      .findOne({ _id: userId })
      .select("-password -emailOtp -passwordOtp");
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    return res
      .status(200)
      .json({ msg: "authenticated user fetched successfully", data: user });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching authenticated user",
      error: error.message,
    });
  }
};
