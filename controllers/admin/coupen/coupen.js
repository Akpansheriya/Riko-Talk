const Database = require("../../../connections/connection");
const Coupen = Database.coupen;

const coupen = async (req, res) => {
  try {
    const { title, percentage, instruction,minimum_amount,expire_date } = req.body;
    const data = {
      title: title,
      percentage: percentage,
      instruction: instruction,
      isActive: true,
      minimum_amount:minimum_amount,
      expire_date:expire_date
    };
    Coupen.create(data).then((result) => {
      res.status(200).send({
        message: "coupen created successfully",
        coupen: result,
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

const coupenData = async (req, res) => {
  try {
    const coupens = await Coupen.findAll({});
    res.status(200).send({
      message: "coupens data",
      coupens: coupens,
    });
  } catch (error) {
    console.error("Error fetching coupens:", error);
    res.status(500).send({
      message: "Error fetching coupens",
      error: error,
    });
  }
};

const updateCoupen = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, percentage, instruction } = req.body;
    const updated = await Coupen.update(
      { title, percentage, instruction },
      { where: { id: id }, returning: true }
    );

    if (updated) {
      const updatedCoupen = await Coupen.findOne({ where: { id: id } });
      res.status(200).send({
        message: "Coupen updated successfully",
        coupen: updatedCoupen,
      });
    } else {
      res.status(404).send({
        message: "Coupen not found",
      });
    }
  } catch (error) {
    console.error("Error updating coupen:", error);
    res.status(500).send({
      message: "Error updating coupen",
      error: error,
    });
  }
};

const deleteCoupen = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Coupen.destroy({ where: { id } });

    if (deleted) {
      res.status(200).send({
        message: "Coupen deleted successfully",
      });
    } else {
      res.status(404).send({
        message: "Coupen not found",
      });
    }
  } catch (error) {
    console.error("Error deleting coupen:", error);
    res.status(500).send({
      message: "Error deleting coupen",
      error: error,
    });
  }
};

const toggleCoupenStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupen = await Coupen.findOne({ where: { id } });

    if (!coupen) {
      return res.status(404).send({
        message: "Coupen not found",
      });
    }

    const newIsActiveStatus = !coupen.isActive;

    const [updated] = await Coupen.update(
      { isActive: newIsActiveStatus },
      { where: { id }, returning: true }
    );

    if (updated) {
      const updatedCoupen = await Coupen.findOne({ where: { id } });
      res.status(200).send({
        message: `Coupen ${
          newIsActiveStatus ? "activated" : "deactivated"
        } successfully`,
        coupen: updatedCoupen,
      });
    } else {
      res.status(404).send({
        message: "Coupen not found",
      });
    }
  } catch (error) {
    console.error("Error toggling coupen status:", error);
    res.status(500).send({
      message: "Error toggling coupen status",
      error: error,
    });
  }
};

module.exports = {
  coupen,
  coupenData,
  updateCoupen,
  deleteCoupen,
  toggleCoupenStatus,
};
