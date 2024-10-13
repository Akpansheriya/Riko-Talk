module.exports = (sequelize, DataTypes) => {
    const Story = sequelize.define("story", {
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
     is_approved:{
        type: DataTypes.BOOLEAN,
     },
      story: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
    });
  
    return Story;
  };
  