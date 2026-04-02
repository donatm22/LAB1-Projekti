const db = require("../../database/db");
const { buildPDF, generateTicketQR } = require("../services/ticketService");

const getRegistrations = (req, res) => {
    db.query('SELECT * FROM "Registrations" ORDER BY id ASC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results.rows);
    });
};

const getRegistrationById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM "Registrations" WHERE id = $1', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }
        res.json(results.rows[0]);
    });
};

const getRegistrationsByEvent = (req, res) => {
    const { event_id } = req.params;

    db.query(
        'SELECT * FROM "Registrations" WHERE event_id = $1 ORDER BY data_regjistrimit DESC',
        [event_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.rows.length === 0) {
                return res.status(404).json({ message: "Nuk ka regjistrime per kete ngjarje" });
            }
            res.json(results.rows);
        }
    );
};

const getRegistrationsByUser = (req, res) => {
    const { user_id } = req.params;

    db.query(
        'SELECT * FROM "Registrations" WHERE user_id = $1 ORDER BY data_regjistrimit DESC',
        [user_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.rows.length === 0) {
                return res.status(404).json({ message: "Nuk ka regjistrime per kete perdorues" });
            }
            res.json(results.rows);
        }
    );
};

const createRegistration = (req, res) => {
    const { event_id, user_id, ticket_id } = req.body;

    if (!event_id || !user_id || !ticket_id) {
        return res.status(400).json({ message: "Ploteso event_id, user_id dhe ticket_id" });
    }
    db.query('SELECT * FROM "Tickets" WHERE id = $1', [ticket_id], (err, ticketResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ message: "Bileta nuk u gjet" });
        }

        const ticket = ticketResult.rows[0];

        if (ticket.sasia <= 0) {
            return res.status(400).json({ message: "Nuk ka bileta te disponueshme" });
        }

        const sql = `INSERT INTO "Registrations" (event_id, user_id, ticket_id, data_regjistrimit, statusi)
                     VALUES ($1, $2, $3, NOW(), 'pending') RETURNING *`;

        db.query(sql, [event_id, user_id, ticket_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.query(
                'UPDATE "Tickets" SET sasia = sasia - 1 WHERE id = $1',
                [ticket_id]
            );

            res.status(201).json({
                message: "Regjistrimi u krye me sukses",
                registration: result.rows[0]
            });
        });
    });
};

const updateRegistration = (req, res) => {
    const { id } = req.params;
    const { statusi } = req.body;

    if (!statusi) {
        return res.status(400).json({ message: "Ploteso statusi" });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(statusi)) {
        return res.status(400).json({ message: "Statusi duhet te jete: pending, confirmed ose cancelled" });
    }

    db.query(
        'UPDATE "Registrations" SET statusi = $1 WHERE id = $2 RETURNING *',
        [statusi, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
            }
            res.json({
                message: "Regjistrimi u perditesua me sukses",
                registration: result.rows[0]
            });
        }
    );
};

const deleteRegistration = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM "Registrations" WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        const registration = result.rows[0];

        db.query('DELETE FROM "Registrations" WHERE id = $1', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.query(
                'UPDATE "Tickets" SET sasia = sasia + 1 WHERE id = $1',
                [registration.ticket_id]
            );

            res.json({ message: "Regjistrimi u fshi me sukses" });
        });
    });
};

const getRegistrationPDF = async (req, res) => {
    const ticket = {
        ticketId: 'TKT-001',
        eventName: 'Sunny Hill Festival - 2026',
        eventDate: '21 June 2026',
        eventTime: '14:00 – 05:00 (next morning)',
        venue: 'Berrnice',
        attendeeName: 'Filan Fisteku'
    };

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticketId}.pdf"`
    });

    buildPDF((chunk) => res.write(chunk), () => res.end(), ticket);
};

const getRegistrationQRCode = async (req, res) => {
    const { id } = req.params;

    db.query('SELECT id FROM "Registrations" WHERE id = $1', [id], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
        }

        try {
            const registrationId = result.rows[0].id;
            const qrBuffer = await generateTicketQR(registrationId);

            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Disposition": `inline; filename="registration-${registrationId}-qr.png"`
            });

            return res.end(qrBuffer);
        } catch (qrError) {
            return res.status(500).json({ error: qrError.message });
        }
    });
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
    getRegistrationQRCode
};