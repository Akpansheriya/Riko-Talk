const sendEmail = require("../../../middlewares/email-sender/emailSender");
const Database = require("../../../connections/connection");

const Auth = Database.user;
const Questions = Database.questions;

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
    const listeners_list = await Auth.findAll({
      where: { role: "listener" },
    });

    if (!listeners_list) {
      return res.status(404).json({
        message: "listeners not found",
      });
    }

    return res.status(200).json({
      message: "listeners list",
      listenersList: listeners_list,
    });
  } catch (error) {
    console.error("Error finding listeners list :", error);
    return res.status(500).json({
      message: "Error finding listeners list ",
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
};
