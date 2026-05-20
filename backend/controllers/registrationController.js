const db = require("../../database/db");
const { buildPDF, generateTicketQR } = require("../services/ticketService");
const {
    sendBookingConfirmation,
    sendBookingCancellation,
} = require("../services/bookingEmailService");

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";
const isOwner = (req, userId) => String(req.user?.id) === String(userId);

const userCanAccessRegistration = (req, registration) =>
    isAdmin(req) ||
    isOwner(req, registration.user_id) ||
    (isOrganizer(req) && String(req.user.id) === String(registration.organizer_id));

const getRegistrationDetails = async (id) => {
    const result = await db.query(
        `SELECT
            r.*,
            u.emri AS user_name,
            u.email AS user_email,
            e.titulli AS event_name,
            e.data_fillimit AS event_start,
            e.data_perfundimit AS event_end,
            e.lokacioni AS event_location,
            e.organizer_id,
            t.tipi AS ticket_type,
            t.cmimi AS ticket_price
         FROM "Registrations" r
         LEFT JOIN "Users" u ON u.id = r.user_id
         LEFT JOIN "Events" e ON e.id = r.event_id
         LEFT JOIN "Tickets" t ON t.id = r.ticket_id
         WHERE r.id = $1
         LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
};

const getRegistrations = (req, res) => {
    const params = [];
    let sql = 'SELECT * FROM "Registrations"';

    if (isOrganizer(req)) {
        sql += ' WHERE event_id IN (SELECT id FROM "Events" WHERE organizer_id = $1)';
        params.push(req.user.id);
    }

    sql += " ORDER BY id ASC";

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(results.rows);
    });
};

const getRegistrationById = async (req, res) => {
    try {
        const registration = await getRegistrationDetails(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        if (!userCanAccessRegistration(req, registration)) {
            return res.status(403).json({ message: "Access denied" });
        }

        return res.json(registration);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getRegistrationsByEvent = (req, res) => {
    const { event_id } = req.params;

    db.query('SELECT organizer_id FROM "Events" WHERE id = $1 LIMIT 1', [event_id], (eventErr, eventResult) => {
        if (eventErr) {
            return res.status(500).json({ error: eventErr.message });
        }

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: "Eventi nuk u gjet" });
        }

        if (isOrganizer(req) && String(eventResult.rows[0].organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

        return db.query(
            'SELECT * FROM "Registrations" WHERE event_id = $1 ORDER BY data_regjistrimit DESC',
            [event_id],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                return res.json(results.rows);
            }
        );
    });
};

const getRegistrationsByUser = (req, res) => {
    const { user_id } = req.params;

    if (!isAdmin(req) && !isOwner(req, user_id)) {
        return res.status(403).json({ message: "Access denied" });
    }

    return db.query(
        'SELECT * FROM "Registrations" WHERE user_id = $1 ORDER BY data_regjistrimit DESC',
        [user_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            return res.json(results.rows);
        }
    );
};

const createRegistration = async (req, res) => {
    const { event_id, ticket_id } = req.body;
    const user_id = req.user?.id;

    if (!event_id || !ticket_id) {
        return res.status(400).json({ message: "Ploteso event_id dhe ticket_id" });
    }

    if (!user_id) {
        return res.status(401).json({ message: "Perdoruesi nuk eshte i autentikuar" });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const ticketResult = await client.query(
            'SELECT * FROM "Tickets" WHERE id = $1 AND event_id = $2 FOR UPDATE',
            [ticket_id, event_id]
        );

        if (ticketResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Bileta nuk u gjet per kete event" });
        }

        const decrementResult = await client.query(
            'UPDATE "Tickets" SET sasia = sasia - 1 WHERE id = $1 AND sasia > 0 RETURNING *',
            [ticket_id]
        );

        if (decrementResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Nuk ka bileta te disponueshme" });
        }

        const result = await client.query(
            `INSERT INTO "Registrations" (event_id, user_id, ticket_id, data_regjistrimit, statusi, reminder_sent)
             VALUES ($1, $2, $3, NOW(), 'pending', false) RETURNING *`,
            [event_id, user_id, ticket_id]
        );

        await client.query("COMMIT");

        const registration = result.rows[0];

        res.status(201).json({
            message: "Regjistrimi u krye me sukses",
            registration,
        });

        getRegistrationDetails(registration.id)
            .then((details) => {
                if (!details) return null;

                return sendBookingConfirmation({
                    userName: details.user_name,
                    userEmail: details.user_email,
                    eventName: details.event_name,
                    eventDate: details.event_start ? new Date(details.event_start).toLocaleString() : "",
                    eventLocation: details.event_location,
                    bookingId: registration.id,
                });
            })
            .catch((error) => {
                console.error("Error sending confirmation email:", error.message);
            });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const updateRegistration = (req, res) => {
    const { id } = req.params;
    const { statusi } = req.body;

    if (!statusi) {
        return res.status(400).json({ message: "Ploteso statusi" });
    }

    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(statusi)) {
        return res.status(400).json({ message: "Statusi duhet te jete: pending, confirmed ose cancelled" });
    }

    db.query(
        `UPDATE "Registrations" r
         SET statusi = $1
         FROM "Events" e
         WHERE r.id = $2
           AND e.id = r.event_id
           AND ($3::boolean OR e.organizer_id = $4)
         RETURNING r.*`,
        [statusi, id, isAdmin(req), req.user.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
            }
            return res.json({
                message: "Regjistrimi u perditesua me sukses",
                registration: result.rows[0],
            });
        }
    );
};

const deleteRegistration = async (req, res) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query('SELECT * FROM "Registrations" WHERE id = $1 FOR UPDATE', [req.params.id]);

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        const details = await getRegistrationDetails(req.params.id);
        const registration = result.rows[0];

        await client.query('DELETE FROM "Registrations" WHERE id = $1', [req.params.id]);
        await client.query('UPDATE "Tickets" SET sasia = sasia + 1 WHERE id = $1', [registration.ticket_id]);
        await client.query("COMMIT");

        res.json({ message: "Regjistrimi u fshi me sukses" });

        if (details) {
            sendBookingCancellation({
                userName: details.user_name,
                userEmail: details.user_email,
                eventName: details.event_name,
            }).catch((error) => {
                console.error("Error sending cancellation email:", error.message);
            });
        }
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const getRegistrationPDF = async (req, res) => {
    try {
        const registration = await getRegistrationDetails(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        if (!userCanAccessRegistration(req, registration)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const start = registration.event_start ? new Date(registration.event_start) : null;
        const end = registration.event_end ? new Date(registration.event_end) : null;
        const ticket = {
            ticketId: registration.id,
            eventName: registration.event_name || "Event",
            eventDate: start ? start.toLocaleDateString() : "TBA",
            eventTime: start ? `${start.toLocaleTimeString()}${end ? ` - ${end.toLocaleTimeString()}` : ""}` : "TBA",
            venue: registration.event_location || "TBA",
            attendeeName: registration.user_name || "Attendee",
        };

        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="ticket-${ticket.ticketId}.pdf"`,
        });

        await buildPDF((chunk) => res.write(chunk), () => res.end(), ticket);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getRegistrationQRCode = async (req, res) => {
    try {
        const registration = await getRegistrationDetails(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        if (!userCanAccessRegistration(req, registration)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const qrBuffer = await generateTicketQR(registration.id);

        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Disposition": `inline; filename="registration-${registration.id}-qr.png"`,
        });

        return res.end(qrBuffer);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getRegistrations,
    getRegistrationById,
    getRegistrationsByEvent,
    getRegistrationsByUser,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationPDF,
    getRegistrationQRCode,
};
