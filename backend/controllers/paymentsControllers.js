const db = require ("../../database/db");

const getPayments = (req, res) =>{
    db.query("SELECT * FROM Payments ORDER BY id ASC", (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getPaymentsById = (req, res) =>{
    const {id} = req.params;
    db.query("SELECT * FROM Payments WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Pagesa e eventit nuk u gjet"
            });
        }
        res.json(result.rows[0]);
    });
};

const createPayment = (req, res) =>{
    const {registration_id, shuma, metoda, data, statusi} = req.body;
    if(!registration_id || !shuma || !metoda || !data || !statusi){
        return res.status(400).json({
            message: "Pagesa nuk eshte plotesuar!"
        });
    }
    db.query("INSERT INTO Payments (registration_id, shuma, metoda, data, statusi) VALUES ($1, $2, $3, $4, $5) RETURNING *", [registration_id, shuma, metoda, data, statusi], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        res.status(201).json({
            message:"Pagesa u shtua me sukses!",
            eventCategories: result.rows[0]
        });
    });
};

const updatePayment = (req, res) =>{
    const { id } = req.params;
    const {registration_id, shuma, metoda, data, statusi} = req.body;
    if(!registration_id || !shuma || !metoda || !data || !statusi){
        return res.status(400).json({
            message: "Input jo valid!"
        });
    }
    db.query("UPDATE Payments SET registration_id = $1, shuma = $2, metoda = $3, data = $4, statusi = $5 WHERE id = $6 RETURNING *", [registration_id, shuma, metoda, data, statusi], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Nuk u shtua Pagesa e perditesuar!"
            });
        }
        res.status(200).json({
            message:"Pagesa u perditesua me sukses",
        });
    });
};

const deletePayments = (req, res) =>{
    const {id} = req.params;
    
    db.query("DELETE FROM Payments WHERE id = $1", [id], (err, result) =>{
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message:"Pagesa nuk u fshi me sukses!"
            });
        }
        res.status(200).json({
            message: "Pagesa eshte fshire me sukses"
        });
    });
};

module.exports = {
    getPayments,
    getPaymentsById,
    createPayment,
    updatePayment,
    deletePayments
};