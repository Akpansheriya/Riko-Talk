module.exports = (sequelize, DataTypes) => {
    const Form = sequelize.define("form", {
      id: {
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
      fullName: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      describe_yourself: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      dob:{
        type: DataTypes.DATE,
        allowNULL: false,
      },
      mobile_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      resume:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question1:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      answer1:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question2:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      answer2:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question3:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      answer3:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question4:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      answer4:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      question5:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
      answer5:{
        type: DataTypes.STRING,
        allowNULL: false,
      },
    });
  
    return Form;
  };
  