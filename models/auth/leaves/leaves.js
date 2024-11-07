module.exports = (sequelize, DataTypes) => {
    const leaves = sequelize.define("leaves", {
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
      
    leave_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    leave_type: {
        type: DataTypes.ENUM('system_generated', 'manual'),
        defaultValue: 'system_generated'
    },
    reason: {
        type: DataTypes.STRING,
        defaultValue: 'Active time less than 3 hours'
    }
}, {
    timestamps: true,
});
    return leaves;
  };
  