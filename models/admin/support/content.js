module.exports = (sequelize, DataTypes) => {
  const content = sequelize.define("content", {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
  });

  return content;
};
