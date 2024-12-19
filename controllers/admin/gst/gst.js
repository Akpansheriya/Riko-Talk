const Database = require("../../../connections/connection");
const Gst = Database.Gst;

const gst = async (req, res) => {
  try {
    const { percentage } = req.body;
    const data = {
      percentage: percentage,
    };
    Gst.create(data).then((result) => {
      res.status(200).send({
        message: "Gst added successfulyy",
        gst: result,
      });
    });
  } catch (error) {
    console.error("Error creating gst:", error);
    res.status(500).send({
      message: "Error creating gst",
      error: error,
    });
  }
};

const editGst = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage } = req.body;

    const existingGst = await Gst.findOne({ where: { id: id } });

    if (!existingGst) {
      return res.status(404).send({
        message: "gst record not found",
      });
    }

    const updatedData = {};
    if (percentage !== undefined) updatedData.percentage = percentage;

    await Gst.update(updatedData, { where: { id: id } });

    res.status(200).send({
      message: "gst record updated successfully",
      updatedData,
    });
  } catch (error) {
    console.error("Error editing gst:", error);
    res.status(500).send({
      message: "Error editing gst",
      error: error,
    });
  }
};

module.exports = {
  gst,
  editGst,
};
