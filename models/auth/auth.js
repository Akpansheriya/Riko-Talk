const crypto = require('crypto'); 

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
      defaultValue: () => {
        return crypto.randomBytes(16).toString('hex').substring(0, 30); 
      },
    },
    
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referal_code: {
      type: DataTypes.STRING,
      
    },
    your_referal_code: {
      type: DataTypes.STRING,
      
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
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
    is_video_call_option: {
      type: DataTypes.BOOLEAN,
    },
    is_audio_call_option: {
      type: DataTypes.BOOLEAN,
    },
    is_chat_option: {
      type: DataTypes.BOOLEAN,
    },
    isActivate: {
      type: DataTypes.BOOLEAN,
    },
    is_session_running: {
      type: DataTypes.BOOLEAN,
    },
    account_freeze: {
      type: DataTypes.BOOLEAN,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
    },
    listener_request_status: {
      type: DataTypes.STRING,
    },
    deactivateDate: {
      type: DataTypes.DATE,
    },
    last_seen: {
      type: DataTypes.DATE,
    },
    otp_session_id: {
      type: DataTypes.STRING,
    },
  });

  return User;
};
