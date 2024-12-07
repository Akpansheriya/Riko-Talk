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
    nick_name: {
      type: DataTypes.STRING,
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
      type: DataTypes.JSON, 
      allowNull: false,
    },
    
    service: {
      type: DataTypes.JSON,
      allowNULL: false,
    },
    languages: {
      type: DataTypes.JSON,
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
    display_image: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    adhar_front: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    adhar_back :{
      type: DataTypes.STRING,
      allowNULL: false,
    },
    pancard: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    voice_charge : {
      type: DataTypes.NUMBER,
      allowNULL: false,
    },
    chat_charge : {
      type: DataTypes.NUMBER,
      allowNULL: false,
    },
    video_charge : {
      type: DataTypes.NUMBER,
      allowNULL: false,
    }
  });

  return listenerProfile;
};
