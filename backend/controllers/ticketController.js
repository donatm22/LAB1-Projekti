const db = require("../../database/db");

const isAdmin = (req) => req.user?.roli === "admin";

const verifyEventWriteAccess = (req, eventId, callback) => {
    if (isAdmin(req)) {
        return callback(null, true);
    }

    return db.query(
        'SELECT id FROM "Events" WHERE id = $1 AND organizer_id = $2 LIMIT 1',
        [eventId, req.user?.id],
        (err, result) => {
            if (err) {
                return callback(err);
            }

            return callback(null, result.rows.length > 0);
        }
    );
};

const getTickets = (req, res) => {
    db.query('SELECT * FROM "Tickets" ORDER BY id ASC', (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getTicketByID = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM "Tickets" WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bileta nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createTicket = (req, res) => {
    const { event_id, tipi, cmimi, sasia } = req.body;

    if (!event_id || !tipi || !cmimi || !sasia) {
        return res.status(400).json({
            message: "Te dhenat nuk u vendosen"
        });
    }

    verifyEventWriteAccess(req, event_id, (accessErr, allowed) => {
        if (accessErr) {
            return res.status(500).json({ error: accessErr.message });
        }

        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }

        db.query(
            'INSERT INTO "Tickets" (event_id, tipi, cmimi, sasia) VALUES($1, $2, $3, $4) RETURNING *',
            [event_id, tipi, cmimi, sasia],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }
                if (result.rows.length === 0) {
                    return res.status(404).json({
                        message: "Nuk u insertua Bileta"
                    });
                }
                res.status(201).json({
                    message: "Bileta u shtua me sukses",
                    ticket: result.rows[0]
                });
            }
        );
    });
};

const updateTicket = (req, res) => {
    const { id } = req.params;
    const { event_id, tipi, cmimi, sasia } = req.body;

    if (!event_id || !tipi || !cmimi || !sasia) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        });
    }

    verifyEventWriteAccess(req, event_id, (accessErr, allowed) => {
        if (accessErr) {
            return res.status(500).json({ error: accessErr.message });
        }

        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }

        const params = [event_id, tipi, cmimi, sasia, id];
        let sql = 'UPDATE "Tickets" SET event_id = $1, tipi = $2, cmimi = $3, sasia = $4 WHERE id = $5';

        if (!isAdmin(req)) {
            sql += ' AND EXISTS (SELECT 1 FROM "Events" e WHERE e.id = "Tickets".event_id AND e.organizer_id = $6)';
            params.push(req.user.id);
        }

        sql += ' RETURNING *';

        db.query(sql, params, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }
                if (result.rows.length === 0) {
                    return res.status(404).json({
                        message: "Bileta nuk u gjet"
                    });
                }
                res.status(200).json({
                    message: "Bileta u perditesua me sukses",
                    ticket: result.rows[0]
                });
            }
        );
    });
};

const deleteTicket = (req, res) => {
    const { id } = req.params;
    const isOrganizerUser = req.user?.roli === "organizer";

    // Only admins can delete tickets directly
    if (isOrganizerUser) {
        return res.status(403).json({
            message: "Access denied. Only admins can delete tickets."
        });
    }

    db.query('DELETE FROM "Tickets" WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Bileta nuk u gjet"
            });
        }
        res.status(200).json({
            message: "Bileta eshte fshire me sukses"
        });
    });
};

module.exports = {
    getTickets,
    getTicketByID,
    createTicket,
    updateTicket,
    deleteTicket
};
