module.exports = (sequelize, DataTypes) => {
    const Questions = sequelize.define("questions", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      question1: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question2: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question3: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question4: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question5: {
        type: DataTypes.STRING,
        allowNULL: false,
      }
    });
  
    return Questions;
  };
  