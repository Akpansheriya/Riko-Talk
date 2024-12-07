const Database = require("../../../connections/connection");
const Wallet = Database.wallet;
const userOrder = Database.userOrder;
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: "rzp_test_riF3R5CXRhzNNC", 
    key_secret: "7a2JNy9d0bVCbbixkoqJJBEi", 
  });


  const recharge = async (req, res) => {
    try {
      const { user_id, amount, type } = req.body;
  
      if (!user_id || !amount || !type) {
        return res.status(400).json({ message: "user_id, amount, and type are required" });
      }
  
      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
  
      const order = await razorpay.orders.create(options);
  
      // Save the order in the database
      await userOrder.create({
        user_id,
        amount,
        type,
        razorpay_order_id: order.id,
        status: "pending",
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
      const { order_id, payment_id, signature, user_id } = req.body;
  
      if (!order_id || !payment_id || !signature || !user_id) {
        return res.status(400).json({ message: "Invalid payment details" });
      }
  
      const hmac = crypto.createHmac("sha256", razorpay.key_secret);
      hmac.update(order_id + "|" + payment_id);
      const generatedSignature = hmac.digest("hex");
  
      if (generatedSignature !== signature) {
        await userOrder.update(
          { status: "failed" },
          { where: { razorpay_order_id: order_id } }
        );
        return res.status(400).json({ message: "Invalid payment signature" });
      }
  
      const wallet = await Wallet.findOne({ where: { user_id } });
  
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found for user" });
      }
  
      // Update wallet balance
      const order = await userOrder.findOne({ where: { razorpay_order_id: order_id } });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      wallet.balance = parseFloat(wallet.balance) + parseFloat(order.amount);
      await wallet.save();
  
      // Update order status and payment details
      order.status = "success";
      order.razorpay_payment_id = payment_id;
      order.razorpay_signature = signature;
      await order.save();
  
      return res.status(200).json({
        message: "Payment verified and wallet updated successfully",
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
  
  

  module.exports = {
    recharge,
    verifyRecharge
  }