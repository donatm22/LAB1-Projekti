const db = require("../../database/db");

const getFeedbacks = (req, res) => {
    db.query("SELECT * FROM Feedback ORDER BY id ASC", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results.rows);
    });
};

const getFeedbackById = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM Feedback WHERE id = $1", [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "Feedback nuk u gjet" });
        }
        res.json(results.rows[0]);
    });
};

const getFeedbackByEvent = (req, res) => {
    const { event_id } = req.params;

    db.query("SELECT * FROM Feedback WHERE event_id = $1 ORDER BY data DESC", [event_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "Nuk ka feedback per kete ngjarje" });
        }
        res.json(results.rows);
    });
};

const createFeedback = (req, res) => {
    const { event_id, user_id, vleresimi, komenti } = req.body;

    if (!event_id || !user_id || !vleresimi) {
        return res.status(400).json({ message: "Ploteso event_id, user_id dhe vleresimi" });
    }

    if (vleresimi < 1 || vleresimi > 5) {
        return res.status(400).json({ message: "Vleresimi duhet te jete ndermjet 1 dhe 5" });
    }

    const sql = `INSERT INTO Feedback (event_id, user_id, vleresimi, komenti, data) 
                 VALUES ($1, $2, $3, $4, NOW()) RETURNING *`;
    const values = [event_id, user_id, vleresimi, komenti];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: "Feedback u shtua me sukses",
            feedback: result.rows[0]
        });
    });
};

const updateFeedback = (req, res) => {
    const { id } = req.params;
    const { vleresimi, komenti } = req.body;

    if (!vleresimi) {
        return res.status(400).json({ message: "Ploteso vleresimi" });
    }

    if (vleresimi < 1 || vleresimi > 5) {
        return res.status(400).json({ message: "Vleresimi duhet te jete ndermjet 1 dhe 5" });
    }

    const sql = `UPDATE Feedback SET vleresimi = $1, komenti = $2 WHERE id = $3 RETURNING *`;
    const values = [vleresimi, komenti, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Feedback nuk u gjet" });
        }
        res.json({
            message: "Feedback u perditesua me sukses",
            feedback: result.rows[0]
        });
    });
};

const deleteFeedback = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM Feedback WHERE id = $1", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Feedback nuk u gjet" });
        }
        res.json({ message: "Feedback u fshi me sukses" });
    });
};

module.exports = {
    getFeedbacks,
    getFeedbackById,
    getFeedbackByEvent,
    createFeedback,
    updateFeedback,
    deleteFeedback
};