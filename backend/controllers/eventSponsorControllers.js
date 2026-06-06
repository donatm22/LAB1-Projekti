const db = require("../../database/db");

const getEventSponsor = async (req, res) => {
  try {
    const sponsors = await db.event_Sponsors.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(sponsors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getEventSponsorById = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await db.event_Sponsors.findUnique({
      where: { id: id },
    });

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsori i eventit nuk u gjet" });
    }

    return res.json(sponsor);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createEventSponsor = async (req, res) => {
  try {
    const { event_id, sponsor_id, shuma } = req.body;

    if (!event_id || !sponsor_id || !shuma) {
      return res.status(400).json({ message: "Sponsori i eventit nuk eshte krijuar!" });
    }

    const newSponsor = await db.event_Sponsors.create({
      data: {
        event_id: event_id,
        sponsor_id: sponsor_id,
        shuma: shuma,
      },
    });

    return res.status(201).json({
      message: "Sponsori i eventit u shtua me sukses!",
      eventSponsors: newSponsor,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateEventSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, sponsor_id, shuma } = req.body;

    if (!event_id || !sponsor_id || !shuma) {
      return res.status(400).json({ message: "Input jo valid!" });
    }

    const updatedSponsor = await db.event_Sponsors.update({
      where: { id: id },
      data: {
        event_id: event_id,
        sponsor_id: sponsor_id,
        shuma: shuma,
      },
    });

    return res.status(200).json({
      message: "Sponsori i eventit u perditesua me sukses",
      eventSponsor: updatedSponsor,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Nuk u shtua Sponsori i eventit i perditesuar!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteEventSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    await db.event_Sponsors.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Sponsori i eventit eshte fshire me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Sponsori i eventit nuk u fshi me sukses!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEventSponsor,
  getEventSponsorById,
  createEventSponsor,
  updateEventSponsor,
  deleteEventSponsor,
};