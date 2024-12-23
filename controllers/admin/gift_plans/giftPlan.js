const Database = require("../../../connections/connection");
const giftPlan = Database.giftPlan;

const createGiftPlan = async (req, res) => {
  try {
    const { gift_amount } = req.body;

    if (!gift_amount) {
      return res.status(400).send({ message: "Gift amount is required" });
    }

    const gstPercentage = 18;
    const gstAmount = (gift_amount * gstPercentage) / 100;
    const netAmount = gift_amount - gstAmount;

    const data = {
      gift_amount,
      gst_amount: gstAmount,
      net_amount: netAmount,
    };

    const result = await giftPlan.create(data);

    res.status(200).send({
      message: "Gift plan created successfully",
      plan: result,
    });
  } catch (error) {
    console.error("Error creating gift plan:", error);
    res.status(500).send({
      message: "Error creating gift plan",
      error: error.message,
    });
  }
};

const getGiftPlans = async (req, res) => {
  try {
    const plans = await giftPlan.findAll();

    res.status(200).send({
      message: "Gift plans fetched successfully",
      plans,
    });
  } catch (error) {
    console.error("Error fetching gift plans:", error);
    res.status(500).send({
      message: "Error fetching gift plans",
      error: error.message,
    });
  }
};

const updateGiftPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { gift_amount } = req.body;

    if (!gift_amount) {
      return res.status(400).send({ message: "Gift amount is required" });
    }

    const gstPercentage = 18;
    const gstAmount = (gift_amount * gstPercentage) / 100;
    const netAmount = gift_amount - gstAmount;

    const data = {
      gift_amount,
      gst_amount: gstAmount,
      net_amount: netAmount,
    };

    const result = await giftPlan.update(data, { where: { id } });

    if (result[0] === 0) {
      return res.status(404).send({ message: "Gift plan not found" });
    }

    res.status(200).send({
      message: "Gift plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating gift plan:", error);
    res.status(500).send({
      message: "Error updating gift plan",
      error: error.message,
    });
  }
};

const deleteGiftPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await giftPlan.destroy({ where: { id } });

    if (!result) {
      return res.status(404).send({ message: "Gift plan not found" });
    }

    res.status(200).send({
      message: "Gift plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gift plan:", error);
    res.status(500).send({
      message: "Error deleting gift plan",
      error: error.message,
    });
  }
};

module.exports = {
  createGiftPlan,
  getGiftPlans,
  updateGiftPlan,
  deleteGiftPlan,
};
