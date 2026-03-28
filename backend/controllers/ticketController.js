const db = require ("../../database/db");

const getTickets = (req, res) => {
    db.query("SELECT * FROM Tickets ORDER BY id ASC", (err, result) => {
        if (err){
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

const createTicket = (req,res) => {
    const {event_id, lloji, cmimi, sasia_disponueshme} = req.body;
    if(!event_id || !lloji || !cmimi || !sasia_disponueshme){
        return res.status(400).json({
            message: "Te dhenat nuk u vendosen"
        })
    }
    db.query("INSERT INTO Tickets (evente_id, lloji, cmimi, sasia_disponueshme) VALUES(1$, 2$, 3$, 4$) RETURNING *", [event_id, lloji, cmimi, sasia_disponueshme], (err, result) => {
        if(err){
            return res.result(500).json({
                error: err.message
            });
        }
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Nuk u insertua Bileta"
            });
        }
        res.status(201).json({
            message: "Sponsori u shtua me sukses",
            ticket: result.rows[0]
        });
    });
};

const updateTicket = (req, res) => {
    const { id } = req.params;
    const {event_id, lloji, cmimi, sasia_disponueshme} = req.body;

    if (!event_id || !lloji || !cmimi || !sasia_disponueshme) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        });
    }

    db.query("UPDATE Tickets SET event_id = $1, lloji = $2, cmimi = $3, sasia_disponueshme = $4 WHERE id = $5 RETURNING *",[event_id, lloji, cmimi, sasia_disponueshme, id],(err, result) => {
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
                message: "Bileta u përditesua me sukses",
                ticket: result.rows[0]
            });
        });
};

const deleteTicket = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM Tickets WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:" Bileta nuk u fshi me sukses!"
            });
        }
        res.status(201).json({
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
