const db = require("../../database/db");

const organizerFields = [
  "emri_organizates",
  "pershkrimi",
  "email",
  "telefoni",
  "website",
];

const normalizeOrganizer = (body) =>
  organizerFields.map((field) => body[field] || null);

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

    return res.json(result.rows[0]);
  });
};

const createOrganizer = (req, res) => {
  db.query(
    'INSERT INTO "Organizers" (emri_organizates, pershkrimi, email, telefoni, website) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    normalizeOrganizer(req.body),
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: "Organizatori u shtua me sukses",
        organizer: result.rows[0],
      });
    }
  );
};

const updateOrganizer = (req, res) => {
  const { id } = req.params;

  db.query(
    'UPDATE "Organizers" SET emri_organizates = $1, pershkrimi = $2, email = $3, telefoni = $4, website = $5 WHERE id = $6 RETURNING *',
    [...normalizeOrganizer(req.body), id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organizatori nuk u gjet" });
      }

      return res.status(200).json({
        message: "Organizatori u perditesua me sukses",
        organizer: result.rows[0],
      });
    }
  );
};

const deleteOrganizer = (req, res) => {
  const { id } = req.params;
  const isOrganizer = req.user?.roli === "organizer";

  // Only admins can delete organizers
  if (isOrganizer) {
    return res.status(403).json({
      message: "Access denied. Only admins can delete organizers."
    });
  }

  db.query('DELETE FROM "Organizers" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }

    return res.json({ message: "Organizatori u fshi me sukses" });
  });
};

module.exports = {
  getOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
};
