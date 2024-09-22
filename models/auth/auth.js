module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    nationality: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    referal_code: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNULL: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
    },
    mobile_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fcm_token: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    },
    is_video_call: {
      type: DataTypes.BOOLEAN,
    },
    isActivate: {
      type: DataTypes.BOOLEAN,
    },
    isSessionRunning: {
      type: DataTypes.BOOLEAN,
    },
    listener_request_status: {
      type: DataTypes.STRING,
    },
    deactivateDate: {
      type: DataTypes.DATE,
    },
  });

  return User;
};
