const { Sequelize, DataTypes } = require("sequelize");
const connect = require("./conn");


const sequelize = new Sequelize(
  connect.DATABASE,
  connect.USER,
  connect.password,

  {
    host: connect.HOST,
    port: connect.port,
    dialect: connect.dialect,
    operatorsAliases: false,

    pool: {
      max: connect.pool.max,
      min: connect.pool.min,
      acquire: connect.pool.acquire,
      idle: connect.pool.idle,
    },
  }
);
try {
 
    sequelize.authenticate();
    console.log("connection established");
  
 
} catch (error) {
  console.log(error);
}

const Database = {};

//------------------ auth ---------------------//

Database.user = require("../models/auth/auth")(
  sequelize,
  DataTypes
);
Database.supportCategory = require("../models/admin/support/category")(
  sequelize,
  DataTypes
);
Database.supportContent = require("../models/admin/support/content")(
  sequelize,
  DataTypes
);
Database.contactCategory = require("../models/admin/contact/category")(
  sequelize,
  DataTypes
);
Database.contactContent = require("../models/admin/contact/content")(
  sequelize,
  DataTypes
);
Database.coupen = require("../models/admin/coupen/coupen")(
  sequelize,
  DataTypes
);
Database.feedback = require("../models/user/feedback/feedback")(
  sequelize,
  DataTypes
);
Database.questions = require("../models/auth/questions/questions")(
  sequelize,
  DataTypes
);
Database.form = require("../models/auth/form/form")(
  sequelize,
  DataTypes
);
Database.listenerProfile = require("../models/auth/listener_profile_setup/listenerProfileSetup")(
  sequelize,
  DataTypes
);
Database.session = require("../models/user/session/sesssion")(
  sequelize,
  DataTypes
);
Database.wallet = require("../models/user/wallet/wallet")(
  sequelize,
  DataTypes
);
Database.blockListener = require("../models/user/block_listener/blockListener")(
  sequelize,
  DataTypes
);
Database.blockUser = require("../models/auth/block_user/blockUser")(
  sequelize,
  DataTypes
);
Database.story = require("../models/auth/story/story")(
  sequelize,
  DataTypes
);
Database.query = require("../models/admin/queries/query")(
  sequelize,
  DataTypes
);
Database.notification = require("../models/user/notification/notification")(
  sequelize,
  DataTypes
);
Database.sessionRejections = require("../models/auth/leaves/sessionRejections")(
  sequelize,
  DataTypes
);
Database.leaves = require("../models/auth/leaves/leaves")(
  sequelize,
  DataTypes
);
Database.listenerActivity = require("../models/auth/leaves/listenerActivity")(
  sequelize,
  DataTypes
);
Database.views = require("../models/auth/story/views")(
  sequelize,
  DataTypes
);
Database.rechargePlan = require("../models/admin/recharge_plan/rechargePlan")(
  sequelize,
  DataTypes
);
Database.admin = require("../models/admin/manage_roles/admin")(
  sequelize,
  DataTypes
);
Database.adminWallet = require("../models/admin/wallet/adminWallet")(
  sequelize,
  DataTypes
);
Database.listenerWallet = require("../models/auth/listener_wallet/listenerWallet")(
  sequelize,
  DataTypes
);
Database.userRecharge = require("../models/user/recharge/recharge")(
  sequelize,
  DataTypes
);
Database.userName = require("../models/auth/user-name/userNames")(
  sequelize,
  DataTypes
);
Database.topics = require("../models/admin/topics/topics")(
  sequelize,
  DataTypes
);
Database.Gst = require("../models/admin/gst/gst")(
  sequelize,
  DataTypes
);
Database.GstRecords = require("../models/admin/gst/gstRecords")(
  sequelize,
  DataTypes
);
Database.gift = require("../models/user/gift/gift")(
  sequelize,
  DataTypes
);
Database.sequelize = sequelize;

Database?.user?.hasMany(Database.listenerProfile, {
  foreignKey: "listenerId",
  as: "listenerProfileData",
});
Database?.user?.hasMany(Database.feedback, {
  foreignKey: "listenerId",
  as: "ratingData",
});
Database?.user?.hasMany(Database.session, {
  foreignKey: "listener_id",
  as: "listenerSessionData",
});
// Story Model Association
Database.story.belongsTo(Database.listenerProfile, {
  foreignKey: "listenerId",
  targetKey: "listenerId", // Match `listenerId` in `ListenerProfile`
  as: "listenerStoryData",
});

// ListenerProfile Model Association (optional if you want reverse association)
Database.listenerProfile.hasMany(Database.story, {
  foreignKey: "listenerId",
  targetKey: "listenerId", // Ensure `listenerId` is used as the reference key
  as: "listenerStories",
});


  Database.sequelize.sync({ force: false }).then(() => {
    console.log("yes sync resync done");
  });




module.exports = { sequelize };
module.exports = Database;
