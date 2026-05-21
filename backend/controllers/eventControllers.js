const db = require("../../database/db");

const parseEventImages = (value) => {
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => parseEventImages(item))
            .filter(Boolean);
    }

    if (typeof value !== "string") {
        return [];
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return [];
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => String(item || "").trim())
                .filter(Boolean);
        }
    } catch {
        // Plain text input is supported below.
    }

    return trimmed
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const serializeEventImages = (images) => {
    const uniqueImages = [...new Set(images.filter(Boolean))];

    if (uniqueImages.length > 10) {
        const error = new Error("You can add up to 10 photos for an event");
        error.statusCode = 400;
        throw error;
    }

    return uniqueImages.length > 0 ? JSON.stringify(uniqueImages) : null;
};

const getUploadedImages = (req) => {
    const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    return files.map((file) => `/uploads/events/${file.filename}`);
};

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";

const buildEventImages = (req, fallbackImageValue = null) => {
    const uploadedImages = getUploadedImages(req);
    const bodyImages = parseEventImages(req.body.imazhi);

    if (uploadedImages.length > 0 || bodyImages.length > 0) {
        return serializeEventImages([...bodyImages, ...uploadedImages]);
    }

    return fallbackImageValue;
};

const getEvents = (req, res) => {
    const shouldScopeToManager = req.query.scope === "manage";
    const isOrganizerUser = req.user?.roli === "organizer";
    const params = [];
    let sql = 'SELECT * FROM "Events"';

    if (shouldScopeToManager && !req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    // Organizers can manage only their own events
    if (shouldScopeToManager && isOrganizerUser) {
        sql += ' WHERE organizer_id = $1';
        params.push(req.user.id);
    }
    // Organizers viewing events see only events they didn't create
    else if (isOrganizerUser && !shouldScopeToManager) {
        sql += ' WHERE organizer_id != $1';
        params.push(req.user.id);
    }

    sql += ' ORDER BY id ASC';

    db.query(sql, params, (err, results) =>{
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
    const isOrganizerUser = req.user?.roli === "organizer";
    
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

        const event = results.rows[0];

        // Organizers cannot view events they created (unless managing)
        if (isOrganizerUser && String(event.organizer_id) === String(req.user.id) && req.query.scope !== "manage") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(event);
    });
};

const createEvent = (req, res) =>{
    const {titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id} = req.body;

    if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id){
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta!"
        });
    }

    const creatorId = isAdmin(req) && req.body.owner_user_id ? req.body.owner_user_id : req.user?.id;

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

            let imageValue;

            try {
                imageValue = buildEventImages(req);
            } catch (error) {
                return res.status(error.statusCode || 500).json({ message: error.message });
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
    const {titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi , organizer_id, category_id} = req.body;
    const {id} = req.params;

    if(!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !organizer_id || !category_id){
        return res.status(400).json({
            message: "Vlerat jane te zbrazeta!"
        });
    }

    const creatorId = isAdmin(req) && req.body.owner_user_id ? req.body.owner_user_id : req.user?.id;

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

            db.query('SELECT imazhi, organizer_id FROM "Events" WHERE id = $1', [id], (eventErr, eventRes) => {
                if (eventErr) {
                    return res.status(500).json({ error: eventErr.message });
                }

                if (eventRes.rows.length === 0) {
                    return res.status(404).json({
                        message: "Eventi nuk u gjet"
                    });
                }

                if (isOrganizer(req) && String(eventRes.rows[0].organizer_id) !== String(req.user.id)) {
                    return res.status(403).json({ message: "Access denied" });
                }

                let imageValue;

                try {
                    imageValue = buildEventImages(req, eventRes.rows[0].imazhi || null);
                } catch (error) {
                    return res.status(error.statusCode || 500).json({ message: error.message });
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
    const isOrganizerUser = req.user?.roli === "organizer";

    // First check if event exists and get its organizer_id
    db.query('SELECT organizer_id FROM "Events" WHERE id = $1', [id], (checkErr, checkResult) => {
        if (checkErr) {
            return res.status(500).json({
                error: checkErr.message
            });
        }

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                message: "Eventi nuk u gjet!"
            });
        }

        // Organizers can only delete their own events
        if (isOrganizerUser && String(checkResult.rows[0].organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Proceed with deletion
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
    });
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
