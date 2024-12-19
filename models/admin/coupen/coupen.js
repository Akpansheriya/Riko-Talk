module.exports = (sequelize, DataTypes) => {
  const Coupen = sequelize.define("coupen", {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instruction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    expire_date:{
      type:DataTypes.DATE,
      allowNull: false,
    },
    minimum_amount:{
      type:DataTypes.INTEGER,
      allowNull: false,
    }
  });

  return Coupen;
};
