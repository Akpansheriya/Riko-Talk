const Database = require("../../../connections/connection");
const Topics = Database.topics;


const topic = async (req, res) => {
  try {
    const { topic } = req.body;
    const data = {
      topic: topic,
      is_active:true
    };
    Topics.create(data).then((result) => {
      res.status(200).send({
        message: "topic created successfulyy",
        topic: result,
      });
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).send({
      message: "Error creating topic",
      error: error,
    });
  }
};

const topicsData = async (req, res) => {
  try {
    const topics = await Topics.findAll({});

    const updatedTopics = topics.map((topic) => ({
      id: topic.id,
      label: topic.topic,
      value: topic.topic,
      is_active: topic.is_active,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    }));

    res.status(200).send({
      message: "topics data",
      topics: updatedTopics,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).send({
      message: "Error fetching topics",
      error: error,
    });
  }
};


const toggleTopicStatus = async (req, res) => {
    try {
      const { id } = req.params; 
      const topic = await Topics.findOne({ where: { id: id } });
  
      if (!topic) {
        return res.status(404).send({
          message: "Topic not found",
        });
      }
 
      const updatedStatus = !topic.is_active;
  
      await Topics.update(
        { is_active: updatedStatus },
        { where: { id: id } }
      );
  
      res.status(200).send({
        message: `Topic status updated successfully to ${updatedStatus}`,
        is_active: updatedStatus,
      });
    } catch (error) {
      console.error("Error toggling topic status:", error);
      res.status(500).send({
        message: "Error toggling topic status",
        error: error,
      });
    }
  };
  
  const deleteTopic = async (req, res) => {
    try {
      const { id } = req.params;
  
      const topic = await Topics.findOne({ where: { id: id } });
  
      if (!topic) {
        return res.status(404).send({
          message: "Topic not found",
        });
      }
  
      await Topics.destroy({ where: { id: id } });
  
      res.status(200).send({
        message: "Topic deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).send({
        message: "Error deleting topic",
        error: error,
      });
    }
  };
  const editTopic = async (req, res) => {
    try {
      const { id } = req.params; 
      const { topic, is_active } = req.body; 
  
      const existingTopic = await Topics.findOne({ where: { id: id } });
  
      if (!existingTopic) {
        return res.status(404).send({
          message: "Topic not found",
        });
      }
  
      const updatedData = {};
      if (topic !== undefined) updatedData.topic = topic;
      if (is_active !== undefined) updatedData.is_active = is_active;
  
      await Topics.update(updatedData, { where: { id: id } });
  
      res.status(200).send({
        message: "Topic updated successfully",
        updatedData,
      });
    } catch (error) {
      console.error("Error editing topic:", error);
      res.status(500).send({
        message: "Error editing topic",
        error: error,
      });
    }
  };
  
module.exports = {
    topic,
    topicsData,
    toggleTopicStatus,
    deleteTopic,
    editTopic
};
