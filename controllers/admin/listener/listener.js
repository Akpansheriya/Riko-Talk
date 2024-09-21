const sendEmail = require("../../../middlewares/email-sender/emailSender");
const Database = require("../../../connections/connection");

const Auth = Database.user;
const Questions = Database.questions;
const Session = Database.session;
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
const listenersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;

    const { count: totalRecords, rows: users } = await Database.user.findAndCountAll({
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
    
      // Destructure the user object and exclude listenerSessionData
      const { listenerSessionData, ...userWithoutSessions } = user.toJSON();
    
      return {
        ...userWithoutSessions,
        listenerProfileData: listenerProfile,
        feedbackStats: {
          totalCount: totalFeedbacks,
          percentage: percentage,
          averageRating: parseFloat(averageRating),
        },
        sessionStats: {
          totalDurationMinutes,
          formattedDuration,
        }
      };
    });
    
    
    res.status(200).json({
      totalRecords: totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: page,
      pageSize,
      users: processedUsers,
    });
  } catch (error) {
    console.error("Error fetching listeners list:", error);
    res.status(500).json({ message: "Internal server error" });
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
          "is_video_call",
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

module.exports = {
  listenerRequestList,
  listenerFormLink,
  storeQuestions,
  updateQuestions,
  listenerRequestApproval,
  listenersList,
  listenerProfile,
  listenerProfileRecent,
};
