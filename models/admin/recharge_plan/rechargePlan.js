module.exports = (sequelize, DataTypes) => {
    const rechargePlan = sequelize.define("rechargePlan", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      recharge_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      gst: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isHighlight: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    });
  
    return rechargePlan;
  };
  