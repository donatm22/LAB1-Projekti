const db = require("../../database/db");
const { sendNotificationToUser } = require("./socketService");

const createNotification = async ({ userId, title, message, type = "info" }) => {
  if (!userId || !title || !message) return null;

  const notification = await db.notifications.create({
    data: {
      user_id: userId,
      title,
      message,
      type,
    },
  });

  sendNotificationToUser(userId, notification);
  return notification;
};

module.exports = {
  createNotification,
};
