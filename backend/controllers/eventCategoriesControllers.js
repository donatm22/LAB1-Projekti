const db = require ("../../database/db");

const getEventCategories = (req, res) =>{
    db.query("SELECT * FROM EventCategories ORDER BY id ASC", (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getEventCategoriesByID = (req, res) =>{
    const {id} = req.params;
    db.query("SELECT * FROM EventCategories WHERE id = $1 ORDER", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Kategoria e eventit nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createEventCategories = (req, res) =>{
    const {emri} = req.body;
    if(!emri){
        return res.status(400).json({
            message: "Emri nuk eshte plotesuar!"
        });
    }
    db.query("INSERT INTO EventCategories (emri) VALUES ($1) RETURNING *", [emri], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.status(201).json({
            message:"Kategoria e Eventit u shtua me sukses!",
            eventCategories: result.rows[0]
        });
    });
};

const updateEventCategories = (req, res) =>{
    const {emri} = req.body;
    if(!emri){
        return res.status(400).json({
            message: "Input jo valid!"
        });
    }
    db.query("UPDATE EventCategories SET emri = $1 WHERE id = $1 RETURNING *", [emri, id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Nuk u shtua Kategoria e perditesuar!"
            });
        }
        res.status(201).json({
            message:"Kategoria u perditesua me sukses",
        });
    });
};

const deleteEventCategories = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM EventCategories WHERE id = 1$", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:" Kategoria e Eventit nuk u fshi me sukses!"
            });
        }
        res.status(201).json({
            message: "Kategoria e Eventit eshte fshire me sukses"
        });
    });
};

module.exports = {
    getEventCategories,
    getEventCategoriesByID,
    createEventCategories,
    updateEventCategories,
    deleteEventCategories
};