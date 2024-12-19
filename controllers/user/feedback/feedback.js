const Database = require("../../../connections/connection");
const Feedback = Database.feedback;

const feedback = async (req, res) => {
  try {
    const { listenerId, userId, rating, feedback } = req.body;
    const data = {
      listenerId: listenerId,
      rating: rating,
      feedback: feedback,
      userId: userId,
    };
    Feedback.create(data).then((result) => {
      res.status(200).send({
        message: "feedback created successfully",
        feedback: result,
      });
    });
  } catch (error) {
    console.error("Error creating coupen:", error);
    res.status(500).send({
      message: "Error creating coupen",
      error: error,
    });
  }
};
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.destroy({
      where: { id: id },
    });

    if (feedback) {
      res.status(200).send({
        message: "Feedback deleted successfully",
      });
    } else {
      res.status(404).send({
        message: "Feedback not found",
      });
    }
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).send({
      message: "Error deleting feedback",
      error: error,
    });
  }
};

module.exports = {
  feedback,
  deleteFeedback
};
