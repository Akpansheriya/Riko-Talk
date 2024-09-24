const { Auth } = require("../models/auth/auth");

const deleteOldInactiveUsers = async () => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    const usersToDelete = await Auth.findAll({
      where: {
        isActivate: false,
        deactivateDate: {
          [Op.lte]: thirtyDaysAgo,
        },
      },
    });

    for (const user of usersToDelete) {
      await Auth.destroy({ where: { id: user.id } });

      console.log(`Deleted user with ID: ${user.id}`);
    }
  } catch (error) {
    console.error("Error deleting old inactive users:", error);
  }
};

module.exports = deleteOldInactiveUsers;
