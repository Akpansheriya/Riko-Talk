
  

  module.exports = (sequelize, DataTypes) => {
    const userOrder = sequelize.define("userOrder", {
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
    });
  
    return userOrder;
  };
  