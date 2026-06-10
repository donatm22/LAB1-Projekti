const db = require("../config/prisma");

const getNotifications = async (req, res) => {
  try {
    const notifications = await db.notifications.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const updateResult = await db.notifications.updateMany({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
      data: { is_read: true },
    });

    if (updateResult.count === 0) {
      return res.status(404).json({ message: "Notification nuk u gjet" });
    }

    const notification = await db.notifications.findUnique({
      where: { id: req.params.id },
    });

    return res.json({ message: "Notification u lexua", notification });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
};
