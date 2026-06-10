const db = require("../config/prisma");

// Middleware to check if organizer owns the event
const checkEventOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.roli === "admin";
    const isOrganizer = req.user?.roli === "organizer";
    const userId = String(req.user?.id);

    console.log(
      `[MIDDLEWARE] checkEventOwnership - User: ${userId}, Role: ${req.user?.roli}, Event ID: ${id}`
    );

    if (isAdmin) {
      console.log("[MIDDLEWARE] Admin user, allowing access");
      return next();
    }

    if (isOrganizer) {
      const event = await db.events.findUnique({
        where: { id },
        select: { organizer_id: true },
      });

      if (!event) {
        console.log("[MIDDLEWARE] Event not found");
        return res.status(404).json({ message: "Eventi nuk u gjet" });
      }

      const eventOwnerId = String(event.organizer_id);
      console.log(
        `[MIDDLEWARE] Event Owner: ${eventOwnerId}, Request User: ${userId}, Match: ${eventOwnerId === userId}`
      );

      if (eventOwnerId !== userId) {
        console.log("[MIDDLEWARE] ACCESS DENIED - Organizer does not own this event");
        return res.status(403).json({
          message: "Access denied. You can only manage events you created.",
        });
      }

      console.log("[MIDDLEWARE] ACCESS ALLOWED - Organizer owns this event");
      return next();
    }

    console.log(`[MIDDLEWARE] Role not recognized: ${req.user?.roli}`);
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("[MIDDLEWARE] Unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = checkEventOwnership;
