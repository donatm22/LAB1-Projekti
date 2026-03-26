const db = require("../../database/db");

const getSpeakers = (req, res) => {
    db.query("SELECT * FROM Speakers ORDER BY id ASC", (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getSpeakersByID = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Speakers WHERE id = $1", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Speakers nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createSpeakers = (req, res) => {
    const { emri, bio } = req.body;
    if (!emri || !bio) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        })
    }
    db.query("INSERT INTO Speakers (emri,bio) VALUES($1, $2) RETURNING *", [emri, bio], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Nuk u insertua Speaker-i"
            });
        }
        res.status(201).json({
            message: "Speaker-i u shtua me sukses",
            speaker: result.rows[0]
        });
    })
};

const updateSpeakers = (req, res) => {
    const { id } = req.params;
    const { emri, bio } = req.body;

    if (!emri || !bio) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        });
    }

    db.query("UPDATE Speakers SET emri = $1, bio = $2 WHERE id = $3 RETURNING *",
        [emri, bio, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Speaker nuk u gjet"
                });
            }
            res.json({
                message: "Speaker-i u përditësua me sukses",
                speaker: result.rows[0]
            });
        }
    );
};

const deleteSpeaker = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM Speakers WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:" Speaker nuk u fshi me sukses!"
            });
        }
        res.status(201).json({
            message: "Speaker eshte fshire me sukses"
        });
    });
};