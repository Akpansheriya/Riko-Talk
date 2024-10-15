module.exports = (sequelize, DataTypes) => {
    const queries = sequelize.define("queries", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      query: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      reply: {
        type: DataTypes.STRING,
       
      },
      status: {
        type: DataTypes.STRING,
        allowNULL: false,
      }

    });
  
    return queries;
  };
  