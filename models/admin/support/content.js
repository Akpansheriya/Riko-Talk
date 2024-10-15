module.exports = (sequelize, DataTypes) => {
  const supportContent = sequelize.define("support_Content", {
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

  return supportContent;
};
