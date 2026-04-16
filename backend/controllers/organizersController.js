const db = require("../../database/db");

const getOrganizers = (req, res) => {
  db.query('SELECT * FROM "Organizers" ORDER BY id ASC', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(result.rows);
  });
};

const getOrganizerById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM "Organizers" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }

    res.json(result.rows[0]);
  });
};

const createOrganizer = (req, res) => {
  const { emri_organizates, pershkrimi, email, telefoni, website } = req.body;

  db.query(
    'INSERT INTO "Organizers" (emri_organizates, pershkrimi, email, telefoni, website) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [emri_organizates || null, pershkrimi || null, email || null, telefoni || null, website || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Organizatori u shtua me sukses",
        organizer: result.rows[0]
      });
    }
  );
};

const updateOrganizer = (req, res) => {
  const { id } = req.params;
  const { emri_organizates, pershkrimi, email, telefoni, website } = req.body;

  db.query(
    'UPDATE "Organizers" SET emri_organizates = $1, pershkrimi = $2, email = $3, telefoni = $4, website = $5 WHERE id = $6 RETURNING *',
    [emri_organizates || null, pershkrimi || null, email || null, telefoni || null, website || null, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organizatori nuk u gjet" });
      }

      res.json({
        message: "Organizatori u perditesua me sukses",
        organizer: result.rows[0]
      });
    }
  );
};

const deleteOrganizer = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM "Organizers" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }

    res.json({ message: "Organizatori u fshi me sukses" });
  });
};

module.exports = {
  getOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer
};
