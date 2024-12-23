module.exports = (sequelize, DataTypes) => {
    const giftPlan = sequelize.define("giftPlan", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      gift_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    });
  
    return giftPlan;
  };
  