module.exports = (sequelize, DataTypes) => {
    const listenerProfile = sequelize.define("listenerProfile", {
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
      display_name: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNULL: false,
      },
      topic: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      service: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      about: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      call_availability_duration: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      dob: {
        type: DataTypes.DATE,
        allowNULL: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
      proof: {
        type: DataTypes.STRING,
        allowNULL: false,
      },
    });
  
    return listenerProfile;
  };
  