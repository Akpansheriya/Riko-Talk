module.exports = (sequelize, DataTypes) => {
    const contactCategory = sequelize.define("contact_category", {
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
  
    return contactCategory;
  };
  