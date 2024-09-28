const Database = require("../../connections/connection");
const Auth = Database.user;
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateToken04 } = require("../../services/zegoCloudService");
const appID = 886950579;
const serverSecret = "5037c5dc318b8483b6c0229c44564e38";

const register = async (req, res) => {
  const mobile = req.body.mobile_number;
  const user = await Auth.findOne({ where: { mobile_number: mobile } });

  if (user) {
    return res.status(409).json({
      message: "User already exists",
    });
  } else {
    const otpResponse = await sendOtp(mobile);
    const userData = {
      fullName: req.body.fullName,
      email: req.body.email,
      mobile_number: req.body.mobile_number,
      role: req.body.role,
      country_code: req.body.country_code,
      listener_request_status: "no request",
      isVerified: false,
      isActivate: true,
      deactivateDate: null,
      nationality: req.body.nationality,
      fcm_token: req.body.fcm_token,
      state: req.body.state,
      referal_code: req.body.referal_code,
      otp_session_id: otpResponse.Details ,
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

  try {
    const user = await Auth.findOne({ where: { mobile_number: mobile } });

    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }

    const random4DigitNumber = Math.floor(1000 + Math.random() * 9000);

    await Auth.update(
      { otp: random4DigitNumber },
      { where: { mobile_number: mobile } }
    );

    const updatedUser = await Auth.findOne({
      where: { mobile_number: mobile },
    });

    res.status(200).json({
      message: "User login successfully",
      result: updatedUser,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};
const verification = async (req, res) => {
  const { id, otp: providedOtp } = req.body;

  try {
    const user = await Auth.findOne({ where: { id: id } });
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }

    if (user.otp === providedOtp) {
      const jwtToken = jwt.sign(
        { id: user.id, mobile_number: user.mobile_number },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const roomID = `${user.id}-${Date.now()}`;
      const payload = {
        app_id: appID,
        room_id: roomID,
        user_id: user.id,
        privilege: {
          1: 1,
          2: 1,
        },
      };
      const roomToken = generateToken04(
        appID,
        user.id,
        serverSecret,
        3600,
        payload
      );

      await Auth.update(
        { isverified: true, token: jwtToken, otp: null },
        { where: { id: user.id } }
      );

      const updatedUser = await Auth.findOne({ where: { id: user.id } });

      return res.status(200).json({
        isverified: true,
        message: "Verified successfully",
        roomToken,
        user: updatedUser,
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
const resendOtp = async (req, res) => {
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
        res.status(200).send({
          message: "otp sent successfully",
          otp: random4DigitNumber,
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
const sendOtp = async (phoneNumber) => {
  const apiKey = "c381bda3-7b3e-11ef-8b17-0200cd936042";
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN3`;

  try {
    const response = await axios.get(url);
    if (response.data.Status === "Success") {
      console.log("OTP sent successfully");
      return response.data;
    } else {
      console.log("Error sending OTP:", response.data.Details);
      throw new Error("OTP sending failed");
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw new Error("Failed to send OTP");
  }
};
const login2Factor = async (req, res) => {
  const mobile = req.body.mobile_number;
  try {
    const user = await Auth.findOne({ where: { mobile_number: mobile } });
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }
    const otpResponse = await sendOtp(mobile);
    await Auth.update(
      { otp_session_id: otpResponse.Details },
      { where: { mobile_number: mobile } }
    );

    const updatedUser = await Auth.findOne({
      where: { mobile_number: mobile },
    });

    res.status(200).json({
      message: "OTP sent successfully",
      result: updatedUser,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};
const verifyOtp2factor = async (req, res) => {
  const { mobile_number, otp_input } = req.body;

  try {
    const user = await Auth.findOne({ where: { mobile_number } });

    if (!user || !user.otp_session_id) {
      return res.status(404).json({ message: "User or OTP session not found" });
    }

    const apiKey = "c381bda3-7b3e-11ef-8b17-0200cd936042";
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${user.otp_session_id}/${otp_input}`;

    const response = await axios.get(url);

    if (response.data.Status === "Success") {
      const token = jwt.sign(
        { id: user.id, mobile_number: user.mobile_number },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const roomID = `${user.id}-${Date.now()}`;
      const payload = {
        app_id: appID,
        room_id: roomID,
        user_id: user.id,
        privilege: {
          1: 1,
          2: 1,
        },
      };
      const roomToken = generateToken04(
        appID,
        user.id,
        serverSecret,
        3600,
        payload
      );

      await Auth.update(
        { isverified: true, token: token, otp_session_id: null },
        { where: { mobile_number: user.mobile_number } }
      );

      const updatedUser = await Auth.findOne({ where: { mobile_number } });

      return res.status(200).json({
        isverified: true,
        message: "Verified successfully",
        roomToken,
        user: updatedUser,
      });
    } else {
      return res.status(400).json({
        isverified: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verification,
  logout,
  deleteProfile,
  resendOtp,
  login2Factor,
  verifyOtp2factor,
};
