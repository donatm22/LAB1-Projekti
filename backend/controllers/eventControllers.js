const db = require("../../database/db");

const buildEventImageValue = (req, fallbackImage = null) => {
    if (req.file) {
        return `/uploads/events/${req.file.filename}`;
    }

    const bodyImage = typeof req.body.imazhi === "string" ? req.body.imazhi.trim() : "";
    if (bodyImage) {
        return bodyImage;
    }

    return fallbackImage;
};

const getEvents = (req, res) => {
    db.query('SELECT * FROM "Events" ORDER BY id ASC', (err, results) =>{
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
    db.query('SELECT * FROM "Events" WHERE id = $1', [id], (err, results)  => {
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
    const imageValue = buildEventImageValue(req);

    if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id || !imageValue){
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta!"
        });
    }

    const creatorId = req.user && req.user.id ? req.user.id : null;

    db.query('SELECT id FROM "Organizers" WHERE id = $1', [organizer_id], (orgErr, orgRes) => {
        if (orgErr) {
            return res.status(500).json({ error: orgErr.message });
        }

        if (orgRes.rows.length === 0) {
            return res.status(400).json({ message: "Organizer not found" });
        }

        db.query('SELECT id FROM "EventCategories" WHERE id = $1', [category_id], (catErr, catRes) => {
            if (catErr) {
                return res.status(500).json({ error: catErr.message });
            }

            if (catRes.rows.length === 0) {
                return res.status(400).json({ message: "Category not found" });
            }

            const sql =
            'INSERT INTO "Events" (titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi, organizer_id, organizer_entity_id, category_id, imazhi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
            const values = [titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi, creatorId, organizer_id, category_id, imageValue];

            db.query(sql, values, (err, result) => {
                if (err){
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "Eventi u shtua me sukses",
                    event: result.rows[0]
                });
            });
        });
    });
};

const updateEvent = (req, res) =>{
    const {titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id, imazhi} = req.body;
    const {id} = req.params;

    const creatorId = req.user && req.user.id ? req.user.id : null;

    db.query('SELECT id FROM "Organizers" WHERE id = $1', [organizer_id], (orgErr, orgRes) => {
        if (orgErr) {
            return res.status(500).json({ error: orgErr.message });
        }

        if (orgRes.rows.length === 0) {
            return res.status(400).json({ message: "Organizer not found" });
        }

        // Validate category exists
        db.query('SELECT id FROM "EventCategories" WHERE id = $1', [category_id], (catErr, catRes) => {
            if (catErr) {
                return res.status(500).json({ error: catErr.message });
            }

            if (catRes.rows.length === 0) {
                return res.status(400).json({ message: "Category not found" });
            }

            db.query('SELECT imazhi FROM "Events" WHERE id = $1', [id], (eventErr, eventRes) => {
                if (eventErr) {
                    return res.status(500).json({ error: eventErr.message });
                }

                if (eventRes.rows.length === 0) {
                    return res.status(404).json({
                        message: "Eventi nuk u gjet"
                    });
                }

                const imageValue = buildEventImageValue(req, eventRes.rows[0].imazhi || null);

                if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id || !imageValue){
                    return res.status(400).json({
                        message: "Vlerat jane te zbrazeta!"
                    });
                }

                const sql =
                'UPDATE "Events" SET titulli = $1, pershkrimi = $2, data_fillimit = $3, data_perfundimit = $4, lokacioni = $5, kapaciteti = $6, statusi = $7, organizer_id = $8, organizer_entity_id = $9, category_id = $10, imazhi = $11 WHERE id = $12 RETURNING *'; 
                const values = [titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi, creatorId, organizer_id, category_id, imageValue, id];

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

                    res.status(200).json({
                        message: "Eventi u perditesua me sukses",
                        event: result.rows[0]
                    });
                });
            });
        });
    });
};

const deleteEvent = (req, res) => {
    const {id} = req.params;

    db.query('DELETE FROM "Events" WHERE id = $1', [id], (err, result) => {
        if(err){
            return res.status(500).json({
                error: err.message
            });
        }
        if(result.rowCount === 0){
            return res.status(404).json({
                message: "Eventi nuk u gjet!"
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
