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
Database.category = require("../models/admin/support/category")(
  sequelize,
  DataTypes
);
Database.content = require("../models/admin/support/content")(
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
Database.story = require("../models/auth/story/story")(
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
  Database.sequelize.sync({ force: false }).then(() => {
    console.log("yes sync resync done");
  });




module.exports = { sequelize };
module.exports = Database;
