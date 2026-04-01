const db = require ("../../database/db");

const getEventSponsor = (req, res) =>{
    db.query("SELECT * FROM EventSponsors ORDER BY id ASC", (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getEventSponsorById = (req, res) =>{
    const {id} = req.params;
    db.query("SELECT * FROM EventSponsors WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Sponsori i eventit nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createEventSponsor = (req, res) =>{
    const {event_id, sponsor_id, shuma} = req.body;
    if(!event_id || !sponsor_id || !shuma){
        return res.status(400).json({
            message: "Sponsori i eventit nuk eshte krijuar!"
        });
    }
    db.query("INSERT INTO EventSponsors (event_id, sponsor_id, shuma) VALUES ($1, $2, $3) RETURNING *", [event_id, sponsor_id, shuma], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.status(201).json({
            message:"Sponsori i eventit u shtua me sukses!",
            eventSponsors: result.rows[0]
        });
    });
};

const updateEventSponsor = (req, res) =>{
    const { id } = req.params;
    const {event_id, sponsor_id, shuma} = req.body;
    if(!event_id || !sponsor_id || !shuma){
        return res.status(400).json({
            message: "Input jo valid!"
        });
    }
    db.query("UPDATE EventSponsors SET event_id = $1, sponsor_id = $2, shuma = $3  WHERE id = $4 RETURNING *", [event_id, sponsor_id, shuma], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Nuk u shtua Sponsori i eventit i perditesuar!"
            });
        }
        res.status(200).json({
            message:"Sponsori i eventit u perditesua me sukses",
        });
    });
};

const deleteEventSponsor = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM EventSponsors WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:"Sponsori i eventit nuk u fshi me sukses!"
            });
        }
        res.status(200).json({
            message: "Sponsori i eventit eshte fshire me sukses"
        });
    });
};

module.exports = {
    getEventSponsor,
    getEventSponsorById,
    createEventSponsor,
    updateEventSponsor,
    deleteEventSponsor
};