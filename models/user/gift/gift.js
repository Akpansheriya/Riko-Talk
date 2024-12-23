
  

  module.exports = (sequelize, DataTypes) => {
    const gift = sequelize.define("gift", {
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
      listener_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
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
      net_gift_amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      transaction_date: {
        type: DataTypes.DATE,
      },
      admin_commission :{
        type:DataTypes.INTEGER
      }
    });
  
    return gift;
  };
  