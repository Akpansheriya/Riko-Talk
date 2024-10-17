const sendEmail = require("../../../middlewares/email-sender/emailSender");
const Database = require("../../../connections/connection");
const uploadToS3 = require("../../../helpers/amazons3");
const Auth = Database.user;
const Questions = Database.questions;
const Session = Database.session;
const Story = Database.story;
const ListenerProfile = Database.listenerProfile;
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
const listenersList = async (socket) => {
  try {
    const page = 1; 
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const { count: totalRecordsData, rows: users } =
      await Database.user.findAndCountAll({
        where: {
          role: "listener",
        },
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
          {
            model: Database.feedback,
            as: "ratingData",
            required: false,
          },
          {
            model: Database.session,
            as: "listenerSessionData",
            required: false,
          },
        ],
        limit: pageSize,
        offset,
      });

    const processedUsers = users.map((user) => {
      const listenerProfile = user.listenerProfileData?.[0] || null;

      const listenerProfileUpdate = {
        id: listenerProfile?.id || null,
        listenerId: listenerProfile?.listenerId || null,
        displayName: listenerProfile?.display_name || null,
        nichName: listenerProfile?.nick_name || null,
        gender: listenerProfile?.gender || null,
        age: listenerProfile?.age || null,
        topic: listenerProfile?.topic || null,
        service: listenerProfile?.service || null,
        about: listenerProfile?.about || null,
        image: listenerProfile?.image || null,
      };

      const feedbacks = user.ratingData || [];
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

      const { listenerSessionData, ratingData, ...userWithoutSessions } =
        user.toJSON();

      return {
        ...userWithoutSessions,
        listenerProfileData: listenerProfile ? listenerProfileUpdate : null,
        feedbackStats: {
          totalCount: totalFeedbacks,
          averageRating: parseFloat(averageRating),
        },
        sessionStats: {
          totalDurationMinutes,
          formattedDuration,
        },
      };
    });

    socket.emit("listenersList", {
      totalRecords: totalRecordsData,
      totalPages: Math.ceil(totalRecordsData / pageSize),
      currentPage: page,
      pageSize,
      users: processedUsers,
    });
  } catch (error) {
    console.error("Error fetching listeners list:", error);
    socket.emit("error", { message: "Internal server error" });
  }
};
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

    res.status(200).json({
      message: "Listener profile found",
      profile: listenerProfile,
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

      const sessionData = {
        user_id: session.user_id,
        listenerId: listenerProfile?.listenerId
          ? listenerProfile?.listenerId
          : null,
        display_name: listenerProfile?.display_name
          ? listenerProfile?.display_name
          : null,
        gender: listenerProfile?.gender ? listenerProfile?.gender : null,
        topic: listenerProfile?.topic ? listenerProfile?.topic : null,
        service: listenerProfile?.service ? listenerProfile?.service : null,
        about: listenerProfile?.about ? listenerProfile?.about : null,
        image: listenerProfile?.image ? listenerProfile?.image : null,
      };

      return {
        ...sessionData,
      };
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
};
