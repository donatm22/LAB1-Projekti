const db = require("../../database/db");

const getTicketTypes = (req, res) => {
  db.query('SELECT * FROM "TicketTypes" ORDER BY id ASC', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(result.rows);
  });
};

const getTicketTypeById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM "TicketTypes" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
    }

    res.json(result.rows[0]);
  });
};

const createTicketType = (req, res) => {
  const { event_id, emri_llojit, pershkrimi, cmimi, sasia_total, sasia_mbetur, statusi } = req.body;

  db.query(
    'INSERT INTO "TicketTypes" (event_id, emri_llojit, pershkrimi, cmimi, sasia_total, sasia_mbetur, statusi) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [event_id || null, emri_llojit || null, pershkrimi || null, cmimi || null, sasia_total || null, sasia_mbetur || null, statusi || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Lloji i biletës u shtua me sukses",
        ticketType: result.rows[0]
      });
    }
  );
};

const updateTicketType = (req, res) => {
  const { id } = req.params;
  const { event_id, emri_llojit, pershkrimi, cmimi, sasia_total, sasia_mbetur, statusi } = req.body;

  db.query(
    'UPDATE "TicketTypes" SET event_id = $1, emri_llojit = $2, pershkrimi = $3, cmimi = $4, sasia_total = $5, sasia_mbetur = $6, statusi = $7 WHERE id = $8 RETURNING *',
    [event_id || null, emri_llojit || null, pershkrimi || null, cmimi || null, sasia_total || null, sasia_mbetur || null, statusi || null, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
      }

      res.json({
        message: "Lloji i biletës u perditesua me sukses",
        ticketType: result.rows[0]
      });
    }
  );
};

const deleteTicketType = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM "TicketTypes" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
    }

    res.json({ message: "Lloji i biletës u fshi me sukses" });
  });
};

module.exports = {
  getTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType
};
