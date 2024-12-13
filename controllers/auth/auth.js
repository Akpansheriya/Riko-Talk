const Database = require("../../connections/connection");
const Auth = Database.user;
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateToken04 } = require("../../services/zegoCloudService");
const appID = 886950579;
const serverSecret = "5037c5dc318b8483b6c0229c44564e38";

// manual otp //

const register = async (req, res) => {
  try {
    const mobile = req.body.mobile_number;
    const user = await Auth.findOne({ where: { mobile_number: mobile } });

    if (user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const generatedCodes = new Set();
    function generateRandomCode() {
      const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let code = "";

      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }

      if (generatedCodes.has(code)) {
        return generateRandomCode();
      }

      generatedCodes.add(code);
      return code;
    }

    const newReferralCode = generateRandomCode();

   
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
      your_referal_code: newReferralCode,
      otp_session_id: otpResponse.Details,
    };

    const newUser = await Auth.create(userData);

    await Database.wallet.create({
      user_id: newUser.id,
      balance: 0.0,
    });

    res.status(201).send({
      message: "User created",
      result: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({
      message: "Error creating user",
      error: error.message,
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
  const { mobile_number, otp_input } = req.body;

  try {
    const user = await Auth.findOne({
      where: { mobile_number: mobile_number },
    });
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }
    if (user.otp == otp_input) {
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

// 2factor otp //

// const register = async (req, res) => {
//   try {
//     const mobile = req.body.mobile_number;
//     const user = await Auth.findOne({ where: { mobile_number: mobile } });

//     if (user) {
//       return res.status(409).json({
//         message: "User already exists",
//       });
//     }
//     const generatedCodes = new Set();

//     function generateRandomCode() {
//       const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//       let code = '';

//       for (let i = 0; i < 6; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         code += characters[randomIndex];
//       }

//       if (generatedCodes.has(code)) {
//         return generateRandomCode();
//       }

//       generatedCodes.add(code);
//       return code;
//     }

//     const newCode = generateRandomCode();

//     const otpResponse = await sendOtp(mobile);
//     const userData = {
//       fullName: req.body.fullName,
//       email: req.body.email,
//       mobile_number: req.body.mobile_number,
//       role: req.body.role,
//       country_code: req.body.country_code,
//       listener_request_status: "no request",
//       isVerified: false,
//       isActivate: true,
//       deactivateDate: null,
//       nationality: req.body.nationality,
//       fcm_token: req.body.fcm_token,
//       state: req.body.state,
//       referal_code: req.body.referal_code,
//       yoour_referal_code: newCode,
//       otp_session_id: otpResponse.Details,
//     };

//     const newUser = await Auth.create(userData);

//     await Database.wallet.create({
//       user_id: newUser.id,
//       balance: 0.0,
//     });

//     res.status(201).send({
//       message: "User created",
//       result: newUser,
//     });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).send({
//       message: "Error creating user",
//       error: error.message,
//     });
//   }
// };

const login2Factor = async (req, res) => {
  const mobile = req.body.mobile_number;

  try {
    if (mobile === 9988776655 || mobile === 9978895047) {
      const user = await Auth.findOne({ where: { mobile_number: mobile } });

      if (!user) {
        return res.status(409).json({
          message: "User does not exist",
        });
      }
      return res.status(200).json({
        message: "OTP sent successfully",
        result: user,
      });
    }
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

    return res.status(200).json({
      message: "OTP sent successfully",
      result: updatedUser,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

const verifyOtp2factor = async (req, res) => {
  const { mobile_number, otp_input } = req.body;

  try {
    if (mobile_number === 9988776655 || mobile_number === 9978895047) {
      const user = await Auth.findOne({ where: { mobile_number } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user?.otp === otp_input) {
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
          { isVerified: true, token: token, otp_session_id: null },
          { where: { mobile_number: user.mobile_number } }
        );

        const updatedUser = await Auth.findOne({ where: { mobile_number } });

        return res.status(200).json({
          isverified: true,
          message: "Verified successfully",
          roomToken,
          user: updatedUser,
        });
      }
    }
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
        { isVerified: true, token: token, otp_session_id: null },
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

const ProfilesData = async (req, res) => {
  const userId = req.params.id;

  try {
    const Profiles = await Database.user.findOne({
      where: { id: userId },
    });
    if (Profiles.role === "listener") {
      const listenerProfile = await Database.user.findOne({
        where: { id: userId },
        attributes: {
          exclude: [
            "referal_code",
            "role",
            "otp",
            "country_code",
            "isVerified",
            "mobile_number",
            "email",
            "fcm_token",
            "token",
            "isActivate",
            "listener_request_status",
            "deactivateDate",
            "adhar_back",
            "adhar_front",
            "pancard",
            "image",
            "dob",
            "about",
            "topic",
            "age",
            "gender",
            "call_availability_duration",
            "nationality",
            "service",
            "otp_session_id",
            "your_referal_code",
            "state",
            "fullName",
          ],
        },
        include: [
          {
            model: Database.listenerProfile,
            as: "listenerProfileData",
            required: false,
          },
        ],
      });

      if (!listenerProfile) {
        return res.status(404).json({
          message: "Listener profile not found",
        });
      }

      const profileData = listenerProfile.toJSON();

      if (
        profileData.listenerProfileData &&
        profileData.listenerProfileData.length > 0
      ) {
        const listenerProfileDetails = profileData.listenerProfileData[0];
        let parsedTopic = [];
        let parsedService = [];

        try {
          parsedTopic = JSON.parse(listenerProfileDetails.topic);
          if (typeof parsedTopic === "string") {
            parsedTopic = JSON.parse(parsedTopic);
          }
        } catch (err) {
          console.warn("Failed to parse topic:", listenerProfileDetails.topic);
        }

        try {
          parsedService = JSON.parse(listenerProfileDetails.service);
          if (typeof parsedService === "string") {
            parsedService = JSON.parse(parsedService);
          }
        } catch (err) {
          console.warn(
            "Failed to parse service:",
            listenerProfileDetails.service
          );
        }

        // Merge listener profile data into main profile object
        Object.assign(profileData, {
          id: listenerProfileDetails.id,
          listenerId: listenerProfileDetails.listenerId,
          nick_name: listenerProfileDetails.nick_name,
          display_name: listenerProfileDetails.display_name,
          display_image: listenerProfileDetails.display_image,
          createdAt: listenerProfileDetails.createdAt,
          updatedAt: listenerProfileDetails.updatedAt,
        });

        // Remove the nested listenerProfileData
        delete profileData.listenerProfileData;
      }

      res.status(200).json({
        message: "profile found",
        profile: profileData,
      });
    } else {
      const ProfilesData = await Database.user.findOne({
        where: { id: userId },
        attributes: [
          "id",
          "fullName",
          "is_video_call_option",
          "is_audio_call_option",
          "is_chat_option",
          "is_session_running",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!ProfilesData) {
        return res.status(404).send({
          message: "Profile not found",
        });
      }

      const profileData = ProfilesData.toJSON();

      profileData.userId = profileData.id;
      profileData.nick_name = "";
      profileData.display_name = profileData.fullName;
      profileData.display_image = "";
      delete profileData.fullName;
      // Send the response
      res.status(200).send({
        message: "profile found",
        profile: profileData,
      });
    }
  } catch (error) {
    console.error("Error fetching listener profile:", error);
    res.status(500).json({
      message: "Internal server error",
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

  try {
    const user = await Auth.findOne({ where: { mobile_number: mobile } });

    if (!user) {
      return res.status(409).json({
        message: "User not exists",
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

    return res.status(200).json({
      message: "OTP resent successfully",
      result: updatedUser,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({
      message: "Error resending OTP",
      error: error.message,
    });
  }
};

const sendOtp = async (phoneNumber) => {
  const apiKey = "c381bda3-7b3e-11ef-8b17-0200cd936042";
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN3/otp - template`;

  try {
    const response = await axios.get(url);
    console.log("response",response.data)
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

// const recentUsersList = async (req, res) => {
//   try {
//     const recentUsers = await Auth.findAll({
//       where: { role: "user" },
//       order: [["createdAt", "DESC"]],
//       limit: 10,
//     });

//     res.status(200).send({
//       message: "recent users list",
//       recentUsersList: recentUsers,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error fetching recent users list",
//       error: error.message,
//     });
//   }
// };
const recentUsersList = async (socket) => {
  try {
    const recentUsers = await Auth.findAll({
      where: { role: "user" },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    socket.emit("recentUsersList", {
      message: "recent users list",
      recentUsersList: recentUsers,
    });
  } catch (error) {
    socket.emit("error", {
      message: "Error fetching recent users list",
      error: error.message,
    });
  }
};

const accountFreeze = async (req, res) => {
  const id = req.body.id;
  try {
    const user = await Auth.findOne({ where: { id: id } });
    
    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }

    const newStatus = !user.account_freeze;
    await Auth.update(
      { account_freeze: newStatus },
      { where: { id: user.id } }
    );

    return res.status(200).json({
      message: `Account freeze status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Error toggling account freeze status:", error);
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
  resendOtp,
  login2Factor,
  verifyOtp2factor,
  recentUsersList,
  ProfilesData,
  accountFreeze,
  
};
