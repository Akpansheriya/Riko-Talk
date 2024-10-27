const { Auth } = require("../models/auth/auth");
const { Op } = require('sequelize');
const moment = require('moment');
const Database = require("../connections/connection");
const ListenerActivityLog = Database.listenerActivity
const Leave = Database.leaves
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



async function calculateDailyActiveTime() {
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    try {
        // Fetch all logs from today
        const logs = await ListenerActivityLog.findAll({
            where: {
                timestamp: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            order: [['userId', 'ASC'], ['timestamp', 'ASC']]
        });

        // Map each user's logs
        const userLogsMap = logs.reduce((acc, log) => {
            if (!acc[log.userId]) {
                acc[log.userId] = [];
            }
            acc[log.userId].push(log);
            return acc;
        }, {});

        // Calculate total active time for each user
        for (const [userId, userLogs] of Object.entries(userLogsMap)) {
            let totalActiveTime = 0;
            let lastActiveTime = null;

            userLogs.forEach(log => {
                if (log.status === 'active') {
                    lastActiveTime = new Date(log.timestamp);
                } else if (log.status === 'inactive' && lastActiveTime) {
                    const inactiveTime = new Date(log.timestamp);
                    totalActiveTime += inactiveTime - lastActiveTime;
                    lastActiveTime = null;
                }
            });

            // If the user was still active at the end of the day
            if (lastActiveTime) {
                totalActiveTime += new Date() - lastActiveTime;
            }

            // Convert total time to hours
            const totalActiveHours = totalActiveTime / (1000 * 60 * 60);

            // Add leave if less than 3 hours
            if (totalActiveHours < 3) {
                await Leave.create({
                    userId: userId,
                    leave_date: moment().format('YYYY-MM-DD'),
                    reason: 'Active time less than 3 hours'
                });
                console.log(`Leave added for user ${userId}`);
            }
        }

        console.log("Daily active time calculation completed.");
    } catch (error) {
        console.error("Error calculating daily active time:", error);
    }
}


module.exports = {deleteOldInactiveUsers,calculateDailyActiveTime};
