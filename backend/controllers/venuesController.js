const db = require("../config/prisma");

const serializeVenue = (venue) => {
  if (!venue) return null;
  if (Array.isArray(venue)) return venue.map(serializeVenue);

  return {
    ...venue,
    kapaciteti: venue.kapaciteti !== null && venue.kapaciteti !== undefined ? Number(venue.kapaciteti) : null,
  };
};

const getVenues = async (req, res) => {
  try {
    const venues = await db.venues.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(serializeVenue(venues));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await db.venues.findUnique({
      where: { id: id },
    });

    if (!venue) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    return res.json(serializeVenue(venue));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createVenue = async (req, res) => {
  try {
    const { emri, adresa, qyteti, kapaciteti, pershkrimi } = req.body;

    const newVenue = await db.venues.create({
      data: {
        emri: emri || null,
        adresa: adresa || null,
        qyteti: qyteti || null,
        kapaciteti: kapaciteti !== undefined && kapaciteti !== null ? BigInt(kapaciteti) : null,
        pershkrimi: pershkrimi || null,
      },
    });

    return res.status(201).json({
      message: "Vendi u shtua me sukses",
      venue: serializeVenue(newVenue),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { emri, adresa, qyteti, kapaciteti, pershkrimi } = req.body;

    const updatedVenue = await db.venues.update({
      where: { id: id },
      data: {
        emri: emri !== undefined ? emri : null,
        adresa: adresa !== undefined ? adresa : null,
        qyteti: qyteti !== undefined ? qyteti : null,
        kapaciteti: kapaciteti !== undefined && kapaciteti !== null ? BigInt(kapaciteti) : (kapaciteti === null ? null : undefined),
        pershkrimi: pershkrimi !== undefined ? pershkrimi : null,
      },
    });

    return res.json({
      message: "Vendi u perditesua me sukses",
      venue: serializeVenue(updatedVenue),
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete venues.",
      });
    }

    await db.venues.delete({
      where: { id: id },
    });

    return res.json({ message: "Vendi u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};
