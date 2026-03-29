const db = require("../../database/db");

const getSponsors = (req, res) => {
    db.query("SELECT * FROM Sponsors ORDER BY id ASC", (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getSponsorById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Sponsors WHERE id = $1", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Sponsori nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createSponsor = (req, res) => {
    const {emertimi, logoja, website, niveli_sponsorizimit} = req.body;
    if (!emertimi || !logoja || !website || !niveli_sponsorizimit) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        })
    }
    db.query("INSERT INTO Sponsors (emertimi, logoja, website, niveli_sponsorizimit) VALUES($1, $2, $3, $4) RETURNING *", [emertimi, logoja, website, niveli_sponsorizimit], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Nuk u insertua Sponsori"
            });
        }
        res.status(201).json({
            message: "Sponsori u shtua me sukses",
            sponsor: result.rows[0]
        });
    })
};

const updateSponsor = (req, res) => {
    const { id } = req.params;
    const { emertimi, logoja, website, niveli_sponsorizimit} = req.body;

    if (!emertimi || !logoja || !website || !niveli_sponsorizimit) {
        return res.status(400).json({
            message: "Te dhenat nuk jane vendosur"
        });
    }

    db.query("UPDATE Sponsors SET emertimi = $1, logoja = $2, website = $3, niveli_sponsorizimit = $4 WHERE id = $5 RETURNING *",
        [emertimi, logoja, website, niveli_sponsorizimit, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Sponsori nuk u gjet"
                });
            }
            res.json({
                message:"Sponsori u përditesua me sukses",
                sponsor: result.rows[0]
            });
        }
    );
};

const deleteSponsor = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM Sponsors WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:"Sponsori nuk u fshi me sukses!"
            });
        }
        res.status(200).json({
            message: "Sponsori eshte fshire me sukses"
        });
    });
};

module.exports = {
    getSponsors,
    getSponsorById,
    createSponsor,
    updateSponsor,
    deleteSponsor
};