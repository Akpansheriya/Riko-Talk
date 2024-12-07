module.exports = (sequelize, DataTypes) => {
    const admin = sequelize.define("admin", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      token: {
        type: DataTypes.STRING,
       
      },
      charge_ratio: {
        type: DataTypes.NUMBER,
      
      },
    });
  
    return admin;
  };
  