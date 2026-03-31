const db = require("../../database/db");
const { buildPDF } = require("../services/ticketService");


const getTickets = (req, res) => {
    db.query("SELECT * FROM Tickets ORDER BY id ASC", (err, result) => {
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
    db.query("SELECT * FROM Tickets WHERE id = $1", [id], (err, result) => {
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
    const { event_id, lloji, cmimi, sasia_disponueshme } = req.body;

    if (!event_id || !lloji || !cmimi || !sasia_disponueshme) {
        return res.status(400).json({
            message: "Te dhenat nuk u vendosen"
        });
    }

    db.query(
        "INSERT INTO Tickets (event_id, lloji, cmimi, sasia_disponueshme) VALUES($1, $2, $3, $4) RETURNING *",
        [event_id, lloji, cmimi, sasia_disponueshme],
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
};

const updateTicket = (req, res) => {
    const { id } = req.params;
    const { event_id, lloji, cmimi, sasia_disponueshme } = req.body;

    if (!event_id || !lloji || !cmimi || !sasia_disponueshme) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        });
    }

    db.query(
        "UPDATE Tickets SET event_id = $1, lloji = $2, cmimi = $3, sasia_disponueshme = $4 WHERE id = $5 RETURNING *",
        [event_id, lloji, cmimi, sasia_disponueshme, id],
        (err, result) => {
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
            res.json({
                message: "Bileta u perditesua me sukses",
                ticket: result.rows[0]
            });
        }
    );
};

const deleteTicket = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM Tickets WHERE id = $1", [id], (err, result) => {
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


const getTicketPDF = async (req, res) => {

    // static info per testim deri t'shtojm te dhena ne DB
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

module.exports = {
    getTickets,
    getTicketByID,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketPDF
};
