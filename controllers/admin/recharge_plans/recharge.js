const Database = require("../../../connections/connection");
const rechargePlan = Database.rechargePlan;


const createNewRecharPlan = async (req, res) => {
  try {
    const { recharge_amount } = req.body;
    const data = {
      recharge_amount: recharge_amount,
      gst: 18,
      isHighlight: false,
    };
    rechargePlan.create(data).then((result) => {
      res.status(200).send({
        message: "recharge plan created successfulyy",
        plan: result,
      });
    });
  } catch (error) {
    console.error("Error creating recharge plan:", error);
    res.status(500).send({
      message: "Error creating recharge plan",
      error: error,
    });
  }
};
const plansData = async (req, res) => {
  try {
    const plans = await rechargePlan.findAll({});
    res.status(200).send({
      message: "recharge plans data",
      plans: plans,
    });
  } catch (error) {
    console.error("Error creating plans:", error);
    res.status(500).send({
      message: "Error creating plans",
      error: error,
    });
  }
};
const updateRechargePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No fields provided for update" });
    }

    const rechargePlans = await rechargePlan.findOne({ where: { id } });
   
    if (!rechargePlans) {
      return res.status(404).send({ message: "Recharge plan not found" });
    }

    await rechargePlans.update(updates);

    res.status(200).send({
      message: "Recharge plan updated successfully",
      plan: rechargePlan,
    });
  } catch (error) {
    console.error("Error updating recharge plan:", error);
    res.status(500).send({
      message: "Error updating recharge plan",
      error: error.message,
    });
  }
};

module.exports = {
  createNewRecharPlan,
  plansData,
  updateRechargePlan,
};
