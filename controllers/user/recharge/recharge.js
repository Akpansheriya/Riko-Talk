const Database = require("../../../connections/connection");
const Wallet = Database.wallet;
const userRecharge = Database.userRecharge;
const Razorpay = require("razorpay");
const crypto = require("crypto");
const GstRecords = Database.GstRecords;
const Gst = Database.Gst;
const Coupen = Database.coupen;
const RechargePlans = Database.rechargePlan;
const razorpay = new Razorpay({
  key_id: "rzp_test_riF3R5CXRhzNNC",
  key_secret: "7a2JNy9d0bVCbbixkoqJJBEi",
});

const recharge = async (req, res) => {
  try {
    const { user_id, amount, type, name, country, state, coupen_id, plan_id } =
      req.body;

    if (!user_id || !amount || !type || !name || !country || !state) {
      return res
        .status(400)
        .json({
          message:
            "user_id, amount, type, name, country, and state are required",
        });
    }

    let discount = 0;
    let planAmount = 0;
    console.log("discount", discount);

    if (plan_id) {
      const plan = await RechargePlans.findOne({ where: { id: plan_id } });
      if (!plan) {
        return res.status(404).json({ message: "Invalid plan_id" });
      }
      planAmount = parseFloat(plan.recharge_amount || 0);
    }

    if (coupen_id) {
      const coupon = await Coupen.findOne({ where: { id: coupen_id } });
      console.log("coupon", coupon);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupen_id" });
      }
      discount = (amount * coupon.percentage) / 100;
    }

    const grossAmount = parseFloat(amount) - discount;

    if (grossAmount <= 0) {
      return res.status(400).json({ message: "Invalid final amount" });
    }

    const gstPercentage = 18;
    const gstAmount = (grossAmount * gstPercentage) / 100;
    const netAmount = grossAmount - gstAmount;
    console.log("gst", gstAmount);

    const options = {
      amount: Math.round((grossAmount + gstAmount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await userRecharge.create({
      user_id,
      amount: grossAmount + gstAmount,
      type,
      razorpay_order_id: order.id,
      status: "pending",
      name,
      gst: gstPercentage,
      country,
      state,
      recharge_amount: grossAmount + discount,
      net_recharge: netAmount,
      transaction_date: new Date(),
      gst_amount: gstAmount,
    });

    return res.status(200).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.message,
    });
  }
};

const verifyRecharge = async (req, res) => {
  try {
    const { order_id, payment_id, signature, user_id, type, state } = req.body;

    if (!order_id || !payment_id || !signature || !user_id || !type || !state) {
      return res.status(400).json({ message: "Invalid payment details" });
    }

    const gstData = await Gst.findOne({});
    if (!gstData) {
      return res.status(404).json({ message: "GST data not found" });
    }

    const gstPercentage = gstData.percentage;

    const hmac = crypto.createHmac("sha256", razorpay.key_secret);
    hmac.update(order_id + "|" + payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      await userRecharge.update(
        { status: "failed" },
        { where: { razorpay_order_id: order_id } }
      );
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const wallet = await Wallet.findOne({ where: { user_id } });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found for user" });
    }

    const order = await userRecharge.findOne({
      where: { razorpay_order_id: order_id },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const gstAmount = (order.amount * gstPercentage) / 100;
    const netAmount = parseFloat(order.recharge_amount);

    wallet.balance = parseFloat(wallet.balance) + netAmount;
    await wallet.save();

    order.status = "success";
    order.razorpay_payment_id = payment_id;
    order.razorpay_signature = signature;
    order.gst = gstPercentage;
    order.net_recharge = netAmount;
    order.transaction_date = new Date();
    await order.save();

    await GstRecords.create({
      percentage: gstPercentage,
      type,
      amount: gstAmount,
      state,
    });

    return res.status(200).json({
      message:
        "Payment verified, wallet updated, and GST recorded successfully",
      wallet,
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

const webhookHandler = async (req, res) => {
  try {
    const webhookSecret = "hqUw@3@Vu35b6Z2";
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(body);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;

      const order = await userRecharge.findOne({
        where: { razorpay_order_id: payment.order_id },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status === "success") {
        return res.status(200).json({ message: "Payment already processed" });
      }

      const gstData = await Gst.findOne({});
      const gstPercentage = gstData.percentage;

      const gstAmount = (order.amount * gstPercentage) / 100;
      const netAmount = parseFloat(order.amount) - gstAmount;

      const wallet = await Wallet.findOne({
        where: { user_id: order.user_id },
      });

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      wallet.balance = parseFloat(wallet.balance) + netAmount;
      await wallet.save();

      order.status = "success";
      order.razorpay_payment_id = payment.id;
      await order.save();

      await GstRecords.create({
        percentage: gstPercentage,
        type: order.type,
        amount: gstAmount,
        state: "Default State",
      });

      return res
        .status(200)
        .json({ message: "Payment processed successfully" });
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Webhook error", error: error.message });
  }
};

module.exports = {
  recharge,
  verifyRecharge,
  webhookHandler,
};
