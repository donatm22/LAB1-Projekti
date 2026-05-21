const db = require("../../database/db");

// Middleware to check if organizer owns the event
const checkEventOwnership = (req, res, next) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.roli === "admin";
        const isOrganizer = req.user?.roli === "organizer";
        const userId = String(req.user?.id);

        console.log(`[MIDDLEWARE] checkEventOwnership - User: ${userId}, Role: ${req.user?.roli}, Event ID: ${id}`);

        // Admins can do anything
        if (isAdmin) {
            console.log(`[MIDDLEWARE] Admin user, allowing access`);
            return next();
        }

        // Organizers must own the event
        if (isOrganizer) {
            db.query(
                'SELECT organizer_id FROM "Events" WHERE id = $1 LIMIT 1',
                [id],
                (err, result) => {
                    if (err) {
                        console.error(`[MIDDLEWARE] Query error:`, err);
                        return res.status(500).json({ error: err.message });
                    }

                    if (result.rows.length === 0) {
                        console.log(`[MIDDLEWARE] Event not found`);
                        return res.status(404).json({ message: "Eventi nuk u gjet" });
                    }

                    const eventOwnerId = String(result.rows[0].organizer_id);
                    console.log(`[MIDDLEWARE] Event Owner: ${eventOwnerId}, Request User: ${userId}, Match: ${eventOwnerId === userId}`);

                    if (eventOwnerId !== userId) {
                        console.log(`[MIDDLEWARE] ACCESS DENIED - Organizer does not own this event`);
                        return res.status(403).json({
                            message: "Access denied. You can only manage events you created."
                        });
                    }

                    console.log(`[MIDDLEWARE] ACCESS ALLOWED - Organizer owns this event`);
                    return next();
                }
            );
            return;
        }

        // Other roles not allowed
        console.log(`[MIDDLEWARE] Role not recognized: ${req.user?.roli}`);
        return res.status(403).json({ message: "Access denied" });
    } catch (error) {
        console.error(`[MIDDLEWARE] Unexpected error:`, error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = checkEventOwnership;
