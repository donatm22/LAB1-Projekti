const db = require("../../database/db");

const getVenues = (req, res) => {
  db.query('SELECT * FROM "Venues" ORDER BY id ASC', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(result.rows);
  });
};

const getVenueById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM "Venues" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    res.json(result.rows[0]);
  });
};

const createVenue = (req, res) => {
  const { emri, adresa, qyteti, kapaciteti, pershkrimi } = req.body;

  db.query(
    'INSERT INTO "Venues" (emri, adresa, qyteti, kapaciteti, pershkrimi) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [emri || null, adresa || null, qyteti || null, kapaciteti || null, pershkrimi || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Vendi u shtua me sukses",
        venue: result.rows[0]
      });
    }
  );
};

const updateVenue = (req, res) => {
  const { id } = req.params;
  const { emri, adresa, qyteti, kapaciteti, pershkrimi } = req.body;

  db.query(
    'UPDATE "Venues" SET emri = $1, adresa = $2, qyteti = $3, kapaciteti = $4, pershkrimi = $5 WHERE id = $6 RETURNING *',
    [emri || null, adresa || null, qyteti || null, kapaciteti || null, pershkrimi || null, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Vendi nuk u gjet" });
      }

      res.json({
        message: "Vendi u perditesua me sukses",
        venue: result.rows[0]
      });
    }
  );
};

const deleteVenue = (req, res) => {
  const { id } = req.params;
  const isOrganizer = req.user?.roli === "organizer";

  // Only admins can delete venues
  if (isOrganizer) {
    return res.status(403).json({
      message: "Access denied. Only admins can delete venues."
    });
  }

  db.query('DELETE FROM "Venues" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    res.json({ message: "Vendi u fshi me sukses" });
  });
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};
