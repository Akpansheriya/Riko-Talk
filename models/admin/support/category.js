module.exports = (sequelize, DataTypes) => {
  const supportCategory = sequelize.define("support_category", {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return supportCategory;
};
