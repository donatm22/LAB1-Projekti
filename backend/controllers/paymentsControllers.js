const db = require ("../../database/db");

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";

const verifyRegistrationWriteAccess = (req, registrationId, callback) => {
    if (isAdmin(req)) {
        return callback(null, true);
    }

    return db.query(
        `SELECT r.id
         FROM "Registrations" r
         JOIN "Events" e ON e.id = r.event_id
         WHERE r.id = $1 AND e.organizer_id = $2
         LIMIT 1`,
        [registrationId, req.user?.id],
        (err, result) => {
            if (err) {
                return callback(err);
            }

            return callback(null, result.rows.length > 0);
        }
    );
};

const getPayments = (req, res) =>{
    const params = [];
    let sql = 'SELECT p.* FROM "Payments" p';

    if (isOrganizer(req)) {
        sql += `
            JOIN "Registrations" r ON r.id = p.registration_id
            JOIN "Events" e ON e.id = r.event_id
            WHERE e.organizer_id = $1`;
        params.push(req.user.id);
    }

    sql += ' ORDER BY p.id ASC';

    db.query(sql, params, (err, result) =>{
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
    const params = [id];
    let sql = `
        SELECT p.*
        FROM "Payments" p
        LEFT JOIN "Registrations" r ON r.id = p.registration_id
        LEFT JOIN "Events" e ON e.id = r.event_id
        WHERE p.id = $1`;

    if (!isAdmin(req)) {
        sql += ' AND e.organizer_id = $2';
        params.push(req.user.id);
    }

    db.query(sql, params, (err, result) =>{
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

    verifyRegistrationWriteAccess(req, registration_id, (accessErr, allowed) => {
        if (accessErr) {
            return res.status(500).json({ error: accessErr.message });
        }

        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }

        db.query('INSERT INTO "Payments" (registration_id, shuma, metoda, data, statusi) VALUES ($1, $2, $3, $4, $5) RETURNING *', [registration_id, shuma, metoda, data, statusi], (err, result) =>{
            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }
            res.status(201).json({
                message:"Pagesa u shtua me sukses!",
                payments: result.rows[0]
            });
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
    verifyRegistrationWriteAccess(req, registration_id, (accessErr, allowed) => {
        if (accessErr) {
            return res.status(500).json({ error: accessErr.message });
        }

        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }

        const params = [registration_id, shuma, metoda, data, statusi, id];
        let sql = 'UPDATE "Payments" SET registration_id = $1, shuma = $2, metoda = $3, data = $4, statusi = $5 WHERE id = $6';

        if (!isAdmin(req)) {
            sql += ` AND EXISTS (
                SELECT 1
                FROM "Registrations" r
                JOIN "Events" e ON e.id = r.event_id
                WHERE r.id = "Payments".registration_id AND e.organizer_id = $7
            )`;
            params.push(req.user.id);
        }

        sql += ' RETURNING *';

        db.query(sql, params, (err, result) =>{
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
    });
};

const deletePayments = (req, res) =>{
    const {id} = req.params;
    
    const params = [id];
    let sql = 'DELETE FROM "Payments" WHERE id = $1';

    if (!isAdmin(req)) {
        sql += ` AND EXISTS (
            SELECT 1
            FROM "Registrations" r
            JOIN "Events" e ON e.id = r.event_id
            WHERE r.id = "Payments".registration_id AND e.organizer_id = $2
        )`;
        params.push(req.user.id);
    }

    db.query(sql, params, (err, result) =>{
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
