module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("notification", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      
     
      title: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      body: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
    });
  
    return Notification;
  };
  