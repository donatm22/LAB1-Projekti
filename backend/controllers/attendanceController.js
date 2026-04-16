const db = require("../../database/db");

const getAttendance = (req, res) => {
  db.query('SELECT * FROM "Attendance" ORDER BY id ASC', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(result.rows);
  });
};

const getAttendanceById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM "Attendance" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Attendance nuk u gjet" });
    }

    res.json(result.rows[0]);
  });
};

const createAttendance = (req, res) => {
  const { registration_id, event_id, user_id, check_in_time, check_out_time, statusi_checkin } = req.body;

  db.query(
    'INSERT INTO "Attendance" (registration_id, event_id, user_id, check_in_time, check_out_time, statusi_checkin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [registration_id || null, event_id || null, user_id || null, check_in_time || null, check_out_time || null, statusi_checkin || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Attendance u shtua me sukses",
        attendance: result.rows[0]
      });
    }
  );
};

const updateAttendance = (req, res) => {
  const { id } = req.params;
  const { registration_id, event_id, user_id, check_in_time, check_out_time, statusi_checkin } = req.body;

  db.query(
    'UPDATE "Attendance" SET registration_id = $1, event_id = $2, user_id = $3, check_in_time = $4, check_out_time = $5, statusi_checkin = $6 WHERE id = $7 RETURNING *',
    [registration_id || null, event_id || null, user_id || null, check_in_time || null, check_out_time || null, statusi_checkin || null, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Attendance nuk u gjet" });
      }

      res.json({
        message: "Attendance u perditesua me sukses",
        attendance: result.rows[0]
      });
    }
  );
};

const deleteAttendance = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM "Attendance" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Attendance nuk u gjet" });
    }

    res.json({ message: "Attendance u fshi me sukses" });
  });
};

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
};
