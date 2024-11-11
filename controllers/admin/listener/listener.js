const sendEmail = require("../../../middlewares/email-sender/emailSender");
const Database = require("../../../connections/connection");
const uploadToS3 = require("../../../helpers/amazons3");
const Auth = Database.user;
const { Op } = require("sequelize");
const Questions = Database.questions;
const { getSocket } = require("../../../services/socketService");
const Session = Database.session;
const sessionRejections = Database.sessionRejections;
const Leaves = Database.leaves;
const Story = Database.story;
const ListenerActivity = Database.listenerActivity;
const ListenerProfile = Database.listenerProfile;
const Views = Database.views
const moment = require("moment")
const { storyList } = require("../../../services/socketService");

const listenerRequestList = async (req, res) => {
  try {
    const listener_request_list = await Auth.findAll({
      where: { listener_request_status: "pending" },
    });

    if (!listener_request_list) {
      return res.status(404).json({
        message: "requests not found",
      });
    }

    return res.status(200).json({
      message: "listener request list",
      requestList: listener_request_list,
    });
  } catch (error) {
    console.error("Error finding listener request :", error);
    return res.status(500).json({
      message: "Error finding listener request ",
      error: error.message,
    });
  }
};
const listenerFormLink = async (req, res) => {
  const userId = req.body.id;

  try {
    const user = await Auth.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await sendEmail(
      user.email,
      "Form Link",
      "Please click the link below to access the form:\n\nhttps://example.com/form-link"
    );

    await Auth.update(
      { listener_request_status: "processing" },
      { where: { id: userId } }
    );
    return res.status(200).json({
      message:
        "User listener request status updated to processing and confirmation email sent.",
    });
  } catch (error) {
    console.error("Error updating listener request status:", error);
    return res.status(500).json({
      message: "Error updating listener request status",
      error: error.message,
    });
  }
};
const storeQuestions = async (req, res) => {
  try {
    const { question1, question2, question3, question4, question5 } = req.body;

    const questionsData = {
      question1,
      question2,
      question3,
      question4,
      question5,
    };

    const newQuestions = await Questions.create(questionsData);

    return res.status(201).json({
      message: "Questions stored successfully",
      questions: newQuestions,
    });
  } catch (error) {
    console.error("Error storing questions:", error);
    return res.status(500).json({
      message: "Error storing questions",
      error: error.message,
    });
  }
};
const updateQuestions = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { question1, question2, question3, question4, question5 } = req.body;

    const questions = await Questions.findByPk(questionId);

    if (!questions) {
      return res.status(404).json({
        message: "Questions not found",
      });
    }
    questions.question1 = question1;
    questions.question2 = question2;
    questions.question3 = question3;
    questions.question4 = question4;
    questions.question5 = question5;
    await questions.save();
    return res.status(200).json({
      message: "Questions updated successfully",
      questions,
    });
  } catch (error) {
    console.error("Error updating questions:", error);
    return res.status(500).json({
      message: "Error updating questions",
      error: error.message,
    });
  }
};
const listenerRequestApproval = async (req, res) => {
  const userId = req.body.id;

  try {
    const user = await Auth.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Auth.update(
      { listener_request_status: "approved", role: "listener" },
      { where: { id: userId } }
    );

    return res.status(200).json({
      message: "User listener request status updated to pending",
    });
  } catch (error) {
    console.error("Error updating listener request status:", error);
    return res.status(500).json({
      message: "Error updating listener request status",
      error: error.message,
    });
  }
};
// const listenersList = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;
//     const offset = (page - 1) * pageSize;

//     const { count: totalRecordsData, rows: users } =
//       await Database.user.findAndCountAll({
//         where: {
//           role: "listener",
//         },
//         attributes: {
//           exclude: [
//             "referal_code",
//             "role",
//             "otp",
//             "country_code",
//             "isVerified",
//             "mobile_number",
//             "email",
//             "fcm_token",
//             "token",
//             "listener_request_status",
//             "deactivateDate",
//           ],
//         },
//         include: [
//           {
//             model: Database.listenerProfile,
//             as: "listenerProfileData",
//             required: false,
//           },
//           {
//             model: Database.feedback,
//             as: "ratingData",
//             required: false,
//           },
//           {
//             model: Database.session,
//             as: "listenerSessionData",
//             required: false,
//           },
//         ],
//         limit: pageSize,
//         offset,
//       });
//     const { count: totalRecords, rows: usersData } =
//       await Database.user.findAndCountAll({
//         where: {
//           role: "listener",
//         },
//       });
//     const processedUsers = users.map((user) => {
//       const listenerProfile = user.listenerProfileData?.[0] || null;

//       const listenerProfileUpdate = {
//         id: listenerProfile?.id || null,
//         listenerId: listenerProfile?.listenerId || null,
//         displayName: listenerProfile?.display_name || null,
//         nichName: listenerProfile?.nick_name || null,
//         gender: listenerProfile?.gender || null,
//         age: listenerProfile?.age || null,
//         topic: listenerProfile?.topic || null,
//         service: listenerProfile?.service || null,
//         about: listenerProfile?.about || null,
//         image: listenerProfile?.image || null,
//       };

//       const feedbacks = user.ratingData || [];
//       const totalFeedbacks = feedbacks.length;

//       const starCounts = [0, 0, 0, 0, 0];
//       let totalStars = 0;

//       feedbacks.forEach((feedback) => {
//         const rating = feedback.rating;
//         if (rating >= 1 && rating <= 5) {
//           starCounts[rating - 1] += 1;
//           totalStars += rating;
//         }
//       });

//       const percentage = starCounts.map((count) =>
//         totalFeedbacks ? (count / totalFeedbacks) * 100 : 0
//       );
//       const averageRating = totalFeedbacks
//         ? (totalStars / totalFeedbacks).toFixed(2)
//         : 0;

//       let totalDurationMinutes = 0;
//       const sessions = user.listenerSessionData || [];
//       sessions.forEach((session) => {
//         totalDurationMinutes += session.total_duration;
//       });

//       let formattedDuration;
//       if (totalDurationMinutes < 1) {
//         formattedDuration = `${(totalDurationMinutes * 60).toFixed(0)} seconds`;
//       } else if (totalDurationMinutes < 60) {
//         formattedDuration = `${totalDurationMinutes.toFixed(2)} minutes`;
//       } else {
//         formattedDuration = `${(totalDurationMinutes / 60).toFixed(2)} hours`;
//       }

//       const { listenerSessionData, ratingData, ...userWithoutSessions } =
//         user.toJSON();

//       return {
//         ...userWithoutSessions,
//         listenerProfileData: listenerProfile ? listenerProfileUpdate : null,
//         feedbackStats: {
//           totalCount: totalFeedbacks,
//           averageRating: parseFloat(averageRating),
//         },
//         sessionStats: {
//           totalDurationMinutes,
//           formattedDuration,
//         },
//       };
//     });

//     res.status(200).json({
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / pageSize),
//       currentPage: page,
//       pageSize,
//       users: processedUsers,
//     });
//   } catch (error) {
//     console.error("Error fetching listeners list:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const listenersList = async (req,res) => {
  try {
    const listenersList = await Auth.findAll({where:{role:"listener"}})
    res.status(200).json({
      message: "Listeners list",
      listenersList: listenersList,
    });
  } catch (error) {
    console.error("Error fetching listeners list:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
const listenerProfile = async (req, res) => {
  const userId = req.params.id;

  try {
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
      profileData.listenerProfileData = profileData.listenerProfileData.map(
        (data) => {
          let parsedTopic = [];
          let parsedService = [];

          try {
            parsedTopic = JSON.parse(data.topic);
            if (typeof parsedTopic === "string") {
              parsedTopic = JSON.parse(parsedTopic);
            }
          } catch (err) {
            console.warn("Failed to parse topic:", data.topic);
          }

          try {
            parsedService = JSON.parse(data.service);
            if (typeof parsedService === "string") {
              parsedService = JSON.parse(parsedService);
            }
          } catch (err) {
            console.warn("Failed to parse service:", data.service);
          }

          return {
            ...data,
            topic:
              Array.isArray(parsedTopic) && parsedTopic.length > 0
                ? parsedTopic
                : null,
            service:
              Array.isArray(parsedService) && parsedService.length > 0
                ? parsedService
                : null,
          };
        }
      );
    }

    res.status(200).json({
      message: "Listener profile found",
      profile: profileData,
    });
  } catch (error) {
    console.error("Error fetching listener profile:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const listenerProfileRecent = async (req, res) => {
  const { userId } = req.params;

  try {
    const sessionData = await Session.findAll({
      where: {
        user_id: userId,
      },
    });

    if (!sessionData || sessionData.length === 0) {
      return res.status(404).json({
        message: "Session data not found",
      });
    }

    const latestSessionsByListener = {};

    sessionData.forEach((session) => {
      const listenerId = session.listener_id;
      if (
        !latestSessionsByListener[listenerId] ||
        new Date(session.createdAt) >
          new Date(latestSessionsByListener[listenerId].createdAt)
      ) {
        latestSessionsByListener[listenerId] = session;
      }
    });

    const latestSessionsArray = Object.values(latestSessionsByListener);

    const listenerIds = latestSessionsArray.map(
      (session) => session.listener_id
    );

    const listeners = await ListenerProfile.findAll({
      where: {
        listenerId: listenerIds,
      },
    });

    const profiles = latestSessionsArray.map((session) => {
      const listenerProfile = listeners.find(
        (listener) => listener.listenerId === session.listener_id
      );

      let parsedTopic = [];
      let parsedService = [];

      if (listenerProfile) {
        try {
          parsedTopic = JSON.parse(listenerProfile.topic);
          if (typeof parsedTopic === "string") {
            parsedTopic = JSON.parse(parsedTopic);
          }
        } catch (error) {
          console.warn("Failed to parse topic:", listenerProfile.topic);
        }

        try {
          parsedService = JSON.parse(listenerProfile.service);
          if (typeof parsedService === "string") {
            parsedService = JSON.parse(parsedService);
          }
        } catch (error) {
          console.warn("Failed to parse service:", listenerProfile.service);
        }
      }

      const sessionData = {
        user_id: session.user_id,
        listener_id: listenerProfile?.listenerId || null,
        display_name: listenerProfile?.display_name || null,
        gender: listenerProfile?.gender || null,
        topic:
          Array.isArray(parsedTopic) && parsedTopic.length > 0
            ? parsedTopic
            : null,
        service:
          Array.isArray(parsedService) && parsedService.length > 0
            ? parsedService
            : null,
        about: listenerProfile?.about || null,
        image: listenerProfile?.image || null,
      };

      return sessionData;
    });

    res.status(200).json({
      message: "Latest listener profiles found",
      profiles,
    });
  } catch (error) {
    console.error("Error fetching listener profiles:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const ratingList = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const user = await Database.user.findOne({
      where: {
        id: userId,
        role: "listener",
      },
      attributes: {
        exclude: [
          "id",
          "fullName",
          "nationality",
          "is_video_call",
          "state",
          "createdAt",
          "updatedAt",
          "isActivate",
          "referal_code",
          "role",
          "otp",
          "country_code",
          "isVerified",
          "mobile_number",
          "email",
          "fcm_token",
          "token",
          "listener_request_status",
          "deactivateDate",
        ],
      },
      include: [
        {
          model: Database.session,
          as: "listenerSessionData",
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const feedbacks = await Database.feedback.findAll({
      where: {
        listenerId: userId,
      },
      limit: pageSize,
      offset: offset,
    });

    const totalFeedbackCount = await Database.feedback.count({
      where: {
        listenerId: userId,
      },
    });

    const totalFeedbacks = feedbacks.length;

    const starCounts = [0, 0, 0, 0, 0];
    let totalStars = 0;

    feedbacks.forEach((feedback) => {
      const rating = feedback.rating;
      if (rating >= 1 && rating <= 5) {
        starCounts[rating - 1] += 1;
        totalStars += rating;
      }
    });

    const percentage = starCounts.map((count) =>
      totalFeedbacks ? (count / totalFeedbacks) * 100 : 0
    );
    const averageRating = totalFeedbacks
      ? (totalStars / totalFeedbacks).toFixed(2)
      : 0;

    let totalDurationMinutes = 0;
    const sessions = user.listenerSessionData || [];
    sessions.forEach((session) => {
      totalDurationMinutes += session.total_duration;
    });

    let formattedDuration;
    if (totalDurationMinutes < 1) {
      formattedDuration = `${(totalDurationMinutes * 60).toFixed(0)} seconds`;
    } else if (totalDurationMinutes < 60) {
      formattedDuration = `${totalDurationMinutes.toFixed(2)} minutes`;
    } else {
      formattedDuration = `${(totalDurationMinutes / 60).toFixed(2)} hours`;
    }

    const { listenerSessionData, ...userWithoutSessions } = user.toJSON();

    const response = {
      pagination: {
        currentPage: page,
        pageSize,
        totalRecords: totalFeedbackCount,
        totalPages: Math.ceil(totalFeedbackCount / pageSize),
      },
      feedbackStats: {
        totalCount: totalFeedbackCount,
        percentage,
        averageRating: parseFloat(averageRating),
      },
      sessionStats: {
        totalDurationMinutes,
        formattedDuration,
      },
      ...userWithoutSessions,
      ratingData: feedbacks,
    };

    res.status(200).json({
      user: response,
    });
  } catch (error) {
    console.error("Error fetching listener data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateNickName = async (req, res) => {
  const { listenerId, nickName } = req.body;

  try {
    const listener = await ListenerProfile.findOne({
      where: { listenerId: listenerId },
    });

    if (!listener) {
      return res.status(404).json({
        message: "listener not found",
      });
    }

    await ListenerProfile.update(
      { nick_name: nickName },
      { where: { listenerId: listenerId } }
    );

    return res.status(200).json({
      message: "Nick name updated successfully",
    });
  } catch (error) {
    console.error("Error updating nick name:", error);
    return res.status(500).json({
      message: "Error updating nick name",
      error: error.message,
    });
  }
};
const story = async (req, res) => {
  try {
    const { listenerId } = req.body;
    const file = req.files?.story?.[0];

    if (!listenerId || !file) {
      return res.status(400).json({
        message: "listenerId and story (image or video) are required",
      });
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 30000);
    });

    const uploadUrl = await Promise.race([
      uploadToS3(file, "stories"),
      timeoutPromise,
    ]);

    const story = await Story.create({
      listenerId,
      story: uploadUrl,
      is_approved: false,
    });

    return res.status(201).json({
      message: "Listener profile created successfully",
      story: story,
    });
  } catch (error) {
    console.error("Error storing listener profile:", error);
    return res.status(500).json({
      message: "Error storing story",
      error: error.message,
    });
  }
};
const approvedStory = async (req, res) => {
  try {
    const { listenerId } = req.body;

    if (!listenerId) {
      return res.status(400).json({ message: "listenerId is required" });
    }

    const listenerStory = await Story.findOne({
      where: { listenerId: listenerId },
    });
    if (!listenerStory) {
      return res.status(404).json({ message: "Listener story not found" });
    }

    await Story.update(
      { is_approved: true },
      {
        where: { listenerId: listenerId },
        returning: true,
      }
    );

    const updatedStory = await Story.findOne({
      where: { listenerId: listenerId },
    });

    const io = getSocket();
    if (io) {
      const page = 1;
      const pageSize = 10;

      const socket = io;
      storyList(socket, { page, pageSize });
    }

    return res.status(200).json({
      message: "Story approved successfully",
      Story: updatedStory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error approving story",
      error: error.message,
    });
  }
};

const views = async (req, res) => {
  try {
    const { storyId,listenerId,userId } = req.body;
    const existView = await Views.findOne({where:{storyId:storyId,listenerId:listenerId,userId:userId}})
    console.log("existView",existView)
    if(existView) {
      res.status(400).send({
        message: "alreay view added",
      });
    }else{
      const data = {
        storyId,listenerId,userId
      };
      Views.create(data).then((result) => {
        res.status(200).send({
          message: "view added successfulyy",
          view: result,
        });
      });
    }
   
  } catch (error) {
    console.error("Error adding views:", error);
    res.status(500).send({
      message: "Error adding views",
      error: error,
    });
  }
};

const viewData = async (req,res) => {
  try {
    const {id} = req.params
    const viewsData = await Views.findAll({
      where: { storyId:id },
    });
    res.status(200).send({
      message: "views list",
      views: viewsData.length,
    });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).send({
      message: "Error fetching views",
      error: error,
    });
  }
}

const setAvailabilityToggle = async (req, res) => {
  const { listenerId, is_video_call, is_audio_call, is_chat } = req.body;

  try {
    const user = await Auth.findOne({
      where: { id: listenerId, role: "listener" },
    });

    if (!user) {
      return res.status(404).json({
        message: "listener not found",
      });
    }
    await Auth.update(
      {
        is_video_call_option: is_video_call,
        is_audio_call_option: is_audio_call,
        is_chat_option: is_chat,
        role: "listener",
      },
      { where: { id: listenerId } }
    );
    const updatedUser = await Auth.findOne({
      where: { id: listenerId, role: "listener" },
    });
    await ListenerActivity.create({
      listenerId: listenerId,
      status: is_audio_call || is_audio_call || is_chat ? "active" : "inactive",
      timestamp: new Date()
  });
    return res.status(200).json({
      message: `listenerId's availability set successfully`,
      response: updatedUser,
    });
  } catch (error) {
    console.error("Error updating listener request status:", error);
    return res.status(500).json({
      message: "Error updating listener request status",
      error: error.message,
    });
  }
};
const leaveRecords = async (req, res) => {
  try {
    const listenerId = req.params.listenerId;

    const sessionRejection = await sessionRejections.findAll({
      where: { listenerId: listenerId },
    });
    const leaveData = await Leaves.findAll({
      where: { listenerId: listenerId },
    });

    if ((!sessionRejection || sessionRejection.length === 0) && (!leaveData || leaveData.length === 0)) {
      return res.status(200).send({
        message: "No leave records found",
        data: [],
      });
    }

    const groupedLeaves = [...sessionRejection, ...leaveData].reduce((acc, record) => {
      const dateKey = new Date(record.rejectedAt || record.leave_date).toLocaleDateString("en-GB");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalLeaves: 0,
          missedSessions: 0,
        };
      }

      if (record.leave_date) {
        acc[dateKey].totalLeaves += 1;
      }

      if (record.rejectedAt) {
        acc[dateKey].missedSessions += 1;
      }

      return acc;
    }, {});

    const todayDateKey = moment().format("DD/MM/YYYY");
    let todayMissedSessions = 0;

    if (groupedLeaves[todayDateKey]) {
      todayMissedSessions = groupedLeaves[todayDateKey].missedSessions;
    }

    let leaveCount = 0;
    const maxAllowedLeaves = 6;
    const leaveChargePerDay = 100;
    const penaltyCharge = 150;
    let penalty2 = 0;
    let penaltyApplied = false;

    const reportData = Object.values(groupedLeaves).map((leave) => {
      if (leave.totalLeaves > 0) {
        leaveCount++;
      }

      // Apply penalty only once if there are 3 or more missed sessions in a day
      if (leave.missedSessions >= 3 && !penaltyApplied) {
        penalty2 += penaltyCharge;
        penaltyApplied = true;
      }

      return {
        dailyReport: leave.date,
        totalLeaves: leave.totalLeaves,
        missedSessions: leave.missedSessions,
      };
    });

    // Check if today’s missed session count triggers a penalty
    if (todayMissedSessions >= 3 && !penaltyApplied) {
      penalty2 += penaltyCharge;
    }

    let extraCharges = 0;
    if (leaveCount > maxAllowedLeaves) {
      extraCharges = (leaveCount - maxAllowedLeaves) * leaveChargePerDay;
    }

    res.status(200).send({
      message: "Daily leave reports",
      leavesCount: leaveCount,
      allowedLeaves: maxAllowedLeaves,
      remainingLeaves: maxAllowedLeaves > leaveCount ? maxAllowedLeaves - leaveCount : 0,
      extraLeaves: leaveCount > maxAllowedLeaves ? leaveCount - maxAllowedLeaves : 0,
      extraCharges: `₹ ${extraCharges}`,
      penalty2: `₹ ${penalty2}`,
      todayMissedSessions,
    });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    return res.status(500).json({
      message: "Error fetching leave records",
      error: error.message,
    });
  }
};


const sessionRecords = async (req, res) => {
  try {
    const listenerId = req.params.listenerId;
    const sessions = await Session.findAll({
      where: {
        listener_id: listenerId,
      },
    });

    if (!sessions || sessions.length === 0) {
      return res.status(200).send({
        message: "No session records found",
        data: [],
      });
    }

    const groupedSessions = sessions.reduce((acc, session) => {
      const dateKey = new Date(session.createdAt).toLocaleDateString("en-GB");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalUsers: 0,
          listeningTime: 0,
          totalEarnings: 0,
        };
      }

      acc[dateKey].totalUsers += 1;
      acc[dateKey].listeningTime += session.total_duration || 0;
      acc[dateKey].totalEarnings += parseFloat(session.amount_deducted) || 0;

      return acc;
    }, {});

    const reportData = Object.values(groupedSessions).map((session) => {
      const avgListeningTime = session.totalUsers
        ? (session.listeningTime / session.totalUsers).toFixed(2)
        : 0;

      return {
        dailyReport: session.date,
        totalUsers: session.totalUsers,
        listeningTime: `${session.listeningTime.toFixed(2)} Min`,
        avgListeningTime: `${avgListeningTime} Min`,
        earning: `₹ ${session.totalEarnings.toFixed(2)}`,
      };
    });

    res.status(200).send({
      message: "daily session reports",
      reports: reportData,
    });
  } catch (error) {
    console.error("Error fetching session records:", error);
    return res.status(500).json({
      message: "Error fetching session records",
      error: error.message,
    });
  }
};

module.exports = {
  listenerRequestList,
  listenerFormLink,
  storeQuestions,
  updateQuestions,
  listenerRequestApproval,
   listenersList,
  listenerProfile,
  listenerProfileRecent,
  ratingList,
  updateNickName,
  story,
  approvedStory,
  setAvailabilityToggle,
  storyList,
  sessionRecords,
  leaveRecords,
  views,
  viewData
};
