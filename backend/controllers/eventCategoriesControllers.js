const db = require ("../../database/db");
const { isLettersOnly, trimString } = require("../utils/validation");

const getEventCategories = (req, res) =>{
    db.query('SELECT * FROM "EventCategories" ORDER BY id ASC', (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getEventCategoriesById = (req, res) =>{
    const {id} = req.params;
    db.query('SELECT * FROM "EventCategories" WHERE id = $1', [id], (err, result) =>{
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
    if (!isLettersOnly(emri)) {
        return res.status(400).json({ message: "Emri i kategorise duhet te permbaje vetem shkronja" });
    }
    db.query('INSERT INTO "EventCategories" (emri) VALUES ($1) RETURNING *', [trimString(emri)], (err, result) =>{
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
    const { id } = req.params;
    const {emri} = req.body;
    if(!emri){
        return res.status(400).json({
            message: "Emri eshte i detyrueshem!"
        });
    }
    if (!isLettersOnly(emri)) {
        return res.status(400).json({ message: "Emri i kategorise duhet te permbaje vetem shkronja" });
    }
    db.query('UPDATE "EventCategories" SET emri = $1 WHERE id = $2 RETURNING *', [trimString(emri), id], (err, result) =>{
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
        res.status(200).json({
            message:"Kategoria u perditesua me sukses",
            eventCategories: result.rows[0]
        });
    });
};

const deleteEventCategories = (req, res) =>{
    const {id} = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    // Only admins can delete categories
    if (isOrganizer) {
        return res.status(403).json({
            message: "Access denied. Only admins can delete categories."
        });
    }
    
    db.query('DELETE FROM "EventCategories" WHERE id = $1', [id], (err, result) =>{
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
        res.status(200).json({
            message: "Kategoria e Eventit eshte fshire me sukses"
        });
    });
};

module.exports = {
    getEventCategories,
    getEventCategoriesById,
    createEventCategories,
    updateEventCategories,
    deleteEventCategories
};
