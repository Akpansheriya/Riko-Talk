module.exports = (sequelize, DataTypes) => {
    const Gst = sequelize.define("Gst", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    });
  
    return Gst;
  };
  