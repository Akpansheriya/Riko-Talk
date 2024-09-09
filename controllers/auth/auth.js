const Database = require("../../connections/connection");
const Auth = Database.user;
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const mobile = req.body.mobile_number;
  const user = await Auth.findOne({ where: { mobile_number: mobile } });

  if (user) {
    return res.status(409).json({
      message: "User already exists",
    });
  } else {
    const random4DigitNumber = Math.floor(1000 + Math.random() * 9000);
    const userData = {
      fullName: req.body.fullName,
      email: req.body.email,
      mobile_number: req.body.mobile_number,
      role: req.body.role,
      listener_request_status:"no request",
      isVerified: false,
      isActivate: true,
      deactivateDate: null,
      nationality: req.body.nationality,
      fcm_token: req.body.fcm_token,
      state: req.body.state,
      referal_code: req.body.referal_code,
      otp: random4DigitNumber,
    };
    Auth.create(userData)
      .then((result) => {
        console.log(result);
        res.status(201).send({
          message: "User created",
          result: result,
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        res.status(500).send({
          message: "Error creating user",
          error: error,
        });
      });
  }
};

const login = async (req, res) => {
  const mobile = req.body.mobile_number;
  const user = await Auth.findOne({ where: { mobile_number: mobile } });

  if (!user) {
    return res.status(409).json({
      message: "User not exists",
    });
  } else {
    const random4DigitNumber = Math.floor(1000 + Math.random() * 9000);

    Auth.update(
      { otp: random4DigitNumber },
      { where: { mobile_number: mobile } }
    )
      .then((result) => {
        console.log(result);
        res.status(201).send({
          message: "User created",
          result: user,
        });
      })
      .catch((error) => {
        console.error("Error login user:", error);
        res.status(500).send({
          message: "Error login user",
          error: error,
        });
      });
  }
};
const verification = async (req, res) => {
  const id = req.body.id;
  const providedOtp = req.body.otp;
  try {
    const user = await Auth.findOne({ where: { id: id } });
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }
    if (user.otp === providedOtp) {
      const token = jwt.sign(
        { id: user.id, mobile_number: user.mobile_number },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      await Auth.update(
        { isverified: true, token: token },
        { where: { id: user.id } }
      );
      return res.status(200).json({
        isverified: true,
        message: "Verified successfully",
        token: token,
        user,
      });
    } else {
      return res.status(400).json({
        isverified: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
const logout = async (req, res) => {
  const id = req.body.id;
  try {
    const user = await Auth.findOne({ where: { id: id } });
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    } else {
      await Auth.update(
        { isVerified: false, token: null },
        { where: { id: user?.id } }
      );
      return res.status(200).json({
        message: "logout successfully",
      });
    }
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Auth.update(
      { isActivate: false, deactivateDate: new Date() },
      { where: { id: id } }
    );
    return res.status(200).json({
      message: "account deactivated",
      user: user,
    });
  } catch (error) {
    console.error("deleting error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
module.exports = {
  register,
  login,
  verification,
  logout,
  deleteProfile,
};
