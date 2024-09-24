module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("category", {
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

  return Category;
};
