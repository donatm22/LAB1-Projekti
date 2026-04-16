const db = require("../../database/db");

const getEventSchedules = (req, res) => {
  db.query('SELECT * FROM "EventSchedules" ORDER BY id ASC', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(result.rows);
  });
};

const getEventSchedulesById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM "EventSchedules" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
    }

    res.json(result.rows[0]);
  });
};

const createEventSchedules = (req, res) => {
  const { event_id, titulli_eventit, pershkrimi, ora_fillimit, ora_mbarimit, salla, speaker_id } = req.body;

  db.query(
    'INSERT INTO "EventSchedules" (event_id, titulli_eventit, pershkrimi, ora_fillimit, ora_mbarimit, salla, speaker_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [event_id || null, titulli_eventit || null, pershkrimi || null, ora_fillimit || null, ora_mbarimit || null, salla || null, speaker_id || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Orari i eventit u shtua me sukses",
        eventSchedule: result.rows[0]
      });
    }
  );
};

const updateEventSchedules = (req, res) => {
  const { id } = req.params;
  const { event_id, titulli_eventit, pershkrimi, ora_fillimit, ora_mbarimit, salla, speaker_id } = req.body;

  db.query(
    'UPDATE "EventSchedules" SET event_id = $1, titulli_eventit = $2, pershkrimi = $3, ora_fillimit = $4, ora_mbarimit = $5, salla = $6, speaker_id = $7 WHERE id = $8 RETURNING *',
    [event_id || null, titulli_eventit || null, pershkrimi || null, ora_fillimit || null, ora_mbarimit || null, salla || null, speaker_id || null, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
      }

      res.json({
        message: "Orari i eventit u perditesua me sukses",
        eventSchedule: result.rows[0]
      });
    }
  );
};

const deleteEventSchedules = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM "EventSchedules" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
    }

    res.json({ message: "Orari i eventit u fshi me sukses" });
  });
};

module.exports = {
  getEventSchedules,
  getEventSchedulesById,
  createEventSchedules,
  updateEventSchedules,
  deleteEventSchedules
};
