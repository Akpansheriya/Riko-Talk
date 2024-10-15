const Database = require("../../../connections/connection");
const Query = Database.query;

const query = async (req, res) => {
  try {
    const { query } = req.body;
    const data = {
      query: query,
      status: "open",
    };
    Query.create(data).then((result) => {
      res.status(200).send({
        message: "Query Submitted successfulyy",
        query: result,
      });
    });
  } catch (error) {
    console.error("Error submitting query:", error);
    res.status(500).send({
      message: "Error submitting query",
      error: error,
    });
  }
};

const queryData = async (req, res) => {
  try {
    const queries = await Query.findAll({ where: { status: "open" } });
    res.status(200).send({
      message: "queries data",
      queries: queries,
    });
  } catch (error) {
    console.error("Error fetching queries :", error);
    res.status(500).send({
      message: "Error fetching queries",
      error: error,
    });
  }
};

const reply = async (req, res) => {
  try {
    const { id, reply } = req.body;

    if (!id || !reply) {
      return res.status(400).send({ message: "ID and reply are required." });
    }

    const [updated] = await Query.update(
      { reply: reply, status: "replied" },
      { where: { id: id } }
    );

    if (updated) {
      const updatedContent = await Query.findOne({ where: { id: id } });
      return res.status(200).send({
        message: "replied successfully",
        reply: updatedContent,
      });
    }

    return res.status(404).send({
      message: "reply not found with the provided ID",
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send({
      message: "Error updating content",
      error: error.message,
    });
  }
};
const replyByQueries = async (req, res) => {
  try {
    const replyData = await Query.findAll({ where: { status: "replied" } });
    res.status(200).send({
      message: "content data",
      replies: replyData,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).send({
      message: "Error fetching replies",
      error: error,
    });
  }
};

module.exports = {
  query,
  queryData,
  reply,
  replyByQueries,
};
