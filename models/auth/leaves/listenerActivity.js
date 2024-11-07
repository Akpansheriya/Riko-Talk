module.exports = (sequelize, DataTypes) => {
  const lisetenerActivity = sequelize.define(
    "lisetenerActivity",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      listenerId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );
  return lisetenerActivity;
};
