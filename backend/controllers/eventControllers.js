const db = require("../../database/db");

const getEvents = (req, res) => {
    db.query("SELECT * FROM Events ORDER BY id ASC", (err, results) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(results.rows);
    });
};

const getEventById = (req, res) => {
    const {id} = req.params;
    db.query("SELECT * FROM Events WHERE id = ?", [id], (err, results)  => {
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(results.rows.length === 0){
            return res.status(404).json({
                message: "Eventi nuk u gjet"
            });
        }
        res.json(results.rows[0]);
    });
};

const createEvent = (req, res) =>{
    const {titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi} = req.body;

    if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id || !imazhi){
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta!"
        });
    }

    const sql =
    "INSERT INTO Events (titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi";
    const values = [titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi];

    db.query(sql, values, (err, result) => {
        if (err){
            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            message: "Eventi u shtua me sukses",
            user: result.rows[0]
        });
    });
};

const updateEvent = (req, res) =>{
    const {titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi} = req.body;

    if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id || !imazhi){
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta!"
        });
    }

    const sql =
    "UPDATE  Events  SET titulli = $1, pershkrimi = $2, data_fillimit = $3, data_perfundimit = $4, lokacioni = $5, kapaciteti = $6, statusi = $7 , organizer_id = $8, category_id = $9, imazhi = $10"; 
    const values = [titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi];

    db.query(sql, values, (err, result) => {
        if (err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Eventi nuk eshte perditesuar"
            });
        }

        res.status(201).json({
            message: "Eventi u shtua me sukses",
        });
    });
};

const deleteEvent = (req, res) => {
    const {id} = req.params;

    db.query("DELETE FROM Events WHERE id = ?", [id], (err, result) => {
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Eventi nuk eshte fshire me sukses!"
            });
        }

        res.json({
            message:"Eventi u fshi me sukses"
        });
    });
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
