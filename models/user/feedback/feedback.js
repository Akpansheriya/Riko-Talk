module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define("feedback", {
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
      rating: {
        type: DataTypes.FLOAT,
        allowNULL: false,
      },
      feedback: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
     
    });
  
    return Feedback;
  };
  