const db = require("../../database/db");

const getEventSpeakers = (req, res) => {
    db.query('SELECT * FROM "Event_Speakers" ORDER BY id ASC', (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getEventSpeakersById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM "Event_Speakers" WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Speaker i eventit nuk u gjet!"
            });
        }
        res.json(result.rows[0]);
    });
};

const createEventSpeakers = (req, res) => {
    const { tema, ora } = req.body;

    if (!tema || !ora) {
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta"
        });
    }

    db.query(
        'INSERT INTO "Event_Speakers" (tema, ora) VALUES ($1, $2) RETURNING *',
        [tema, ora],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            res.status(201).json({
                message: "Speakeri u shtua me sukses",
                eventSpeakers: result.rows[0]
            });
        }
    );
};

const updateEventSpeakers = (req, res) => {
    const { id } = req.params;
    const { tema, ora } = req.body;

    if (!tema || !ora) {
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta"
        });
    }

    db.query(
        'UPDATE "Event_Speakers" SET tema = $1, ora = $2 WHERE id = $3 RETURNING *',
        [tema, ora, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({
                    message: "Speaker i eventit nuk u gjet!"
                });
            }
            res.status(200).json({
                message: "Speakeri i eventit u perditesua me sukses",
                eventSpeakers: result.rows[0]
            });
        }
    );
};

const deleteEventSpeakers = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM "Event_Speakers" WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Speaker i eventit nuk u gjet!"
            });
        }
        res.status(200).json({
            message: "Speakeri i eventit u fshi me sukses"
        });
    });
};

module.exports = {
    getEventSpeakers,
    getEventSpeakersById,
    createEventSpeakers,
    updateEventSpeakers,
    deleteEventSpeakers
};
