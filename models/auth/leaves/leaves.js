module.exports = (sequelize, DataTypes) => {
    const leaves = sequelize.define("leaves", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      listenerId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNULL: false,
      },
    });
  
    return leaves;
  };
  