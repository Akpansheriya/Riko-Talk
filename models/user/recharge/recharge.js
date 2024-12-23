
  

  module.exports = (sequelize, DataTypes) => {
    const userRecharge = sequelize.define("user_recharge", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      coupen_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING, 
        defaultValue: "pending",
      },
      razorpay_order_id: {
        type: DataTypes.STRING,
      },
      razorpay_payment_id: {
        type: DataTypes.STRING,
      },
      razorpay_signature: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      gst: {
        type: DataTypes.INTEGER,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      country: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      recharge_amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      net_recharge: {
        type: DataTypes.DECIMAL(10, 2),
      },
      transaction_date: {
        type: DataTypes.DATE,
      },
    });
  
    return userRecharge;
  };
  