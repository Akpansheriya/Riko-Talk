module.exports = (sequelize, DataTypes) => {
    const sessionRejections = sequelize.define("sessionRejections", {
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
  
    return sessionRejections;
  };
  