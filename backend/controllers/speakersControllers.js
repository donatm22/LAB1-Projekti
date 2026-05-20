const db = require("../../database/db");

const speakerSelectQuery = `
    SELECT s.*,
           COALESCE(
               ARRAY_AGG(DISTINCT es.event_id) FILTER (WHERE es.event_id IS NOT NULL),
               ARRAY[]::uuid[]
           ) AS event_ids
    FROM "Speakers" s
    LEFT JOIN "Event_Speakers" es ON es.speaker_id = s.id
`;

const normalizeEventIds = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof value !== "string") {
        return [];
    }

    return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const getSpeakers = (req, res) => {
    db.query(`${speakerSelectQuery} GROUP BY s.id ORDER BY s.id ASC`, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.json(result.rows);
    });
};

const getSpeakersById = (req, res) => {
    const { id } = req.params;
    db.query(`${speakerSelectQuery} WHERE s.id = $1 GROUP BY s.id`, [id], (err, result) => {
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
        res.json(result.rows[0]);
    });
};

const createSpeakers = async (req, res) => {
    const { emri } = req.body;
    const eventIds = normalizeEventIds(req.body.event_ids);

    if (!emri) {
        return res.status(400).json({
            message: "Emri eshte i detyrueshem"
        });
    }

    if (eventIds.length === 0) {
        return res.status(400).json({
            message: "Speaker-i duhet te lidhet me te pakten nje event"
        });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const eventCheck = await client.query(
            'SELECT id FROM "Events" WHERE id = ANY($1::uuid[])',
            [eventIds]
        );

        if (eventCheck.rows.length !== eventIds.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Nje ose me shume evente nuk u gjeten"
            });
        }

        const speakerResult = await client.query(
            'INSERT INTO "Speakers" (emri) VALUES ($1) RETURNING *',
            [emri]
        );

        const speaker = speakerResult.rows[0];

        await Promise.all(
            eventIds.map((eventId) =>
                client.query(
                    'INSERT INTO "Event_Speakers" (event_id, speaker_id) VALUES ($1, $2)',
                    [eventId, speaker.id]
                )
            )
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Speaker-i u shtua me sukses",
            speaker: {
                ...speaker,
                event_ids: eventIds
            }
        });
    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(500).json({
            error: err.message
        });
    } finally {
        client.release();
    }
};

const updateSpeakers = async (req, res) => {
    const { id } = req.params;
    const { emri } = req.body;
    const eventIds = normalizeEventIds(req.body.event_ids);

    if (!emri) {
        return res.status(400).json({
            message: "Emri eshte i detyrueshem"
        });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            'UPDATE "Speakers" SET emri = $1 WHERE id = $2 RETURNING *',
            [emri, id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message:"Speaker nuk u gjet"
            });
        }

        if (eventIds.length > 0) {
            const eventCheck = await client.query(
                'SELECT id FROM "Events" WHERE id = ANY($1::uuid[])',
                [eventIds]
            );

            if (eventCheck.rows.length !== eventIds.length) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    message: "Nje ose me shume evente nuk u gjeten"
                });
            }

            await client.query('DELETE FROM "Event_Speakers" WHERE speaker_id = $1', [id]);

            await Promise.all(
                eventIds.map((eventId) =>
                    client.query(
                        'INSERT INTO "Event_Speakers" (event_id, speaker_id) VALUES ($1, $2)',
                        [eventId, id]
                    )
                )
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            message:"Speaker-i u perditesua me sukses",
            speaker: {
                ...result.rows[0],
                event_ids: eventIds.length > 0 ? eventIds : undefined
            }
        });
    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(500).json({
            error: err.message
        });
    } finally {
        client.release();
    }
};

const deleteSpeakers = (req, res) =>{
    const {id} = req.params;
    
    db.query('DELETE FROM "Speakers" WHERE id = $1', [id], (err, result) =>{
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
        res.status(200).json({
            message: "Speaker eshte fshire me sukses"
        });
    });
};

module.exports = {
    getSpeakers,
    getSpeakersById,
    createSpeakers,
    updateSpeakers,
    deleteSpeakers
};
