module.exports = (sequelize, DataTypes) => {
    const listenerWallet = sequelize.define("listenerWallet", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      listener_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
    });
  
    return listenerWallet;
  };
  