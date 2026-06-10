const db = require("../config/prisma");

const getSponsors = async (req, res) => {
  try {
    const sponsors = await db.sponsors.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(sponsors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getSponsorById = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await db.sponsors.findUnique({
      where: { id: id },
    });

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsori nuk u gjet" });
    }

    return res.json(sponsor);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createSponsor = async (req, res) => {
  try {
    const { emertimi, logoja, website, niveli_sponsorizimit } = req.body;

    if (!emertimi || !logoja || !website || !niveli_sponsorizimit) {
      return res.status(400).json({ message: "Te dhenat nuk jane vendosur" });
    }

    const newSponsor = await db.sponsors.create({
      data: {
        emertimi,
        logoja,
        website,
        niveli_sponsorizimit,
      },
    });

    return res.status(201).json({
      message: "Sponsori u shtua me sukses",
      sponsor: newSponsor,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const { emertimi, logoja, website, niveli_sponsorizimit } = req.body;

    if (!emertimi || !logoja || !website || !niveli_sponsorizimit) {
      return res.status(400).json({ message: "Te dhenat nuk jane vendosur" });
    }

    const updatedSponsor = await db.sponsors.update({
      where: { id: id },
      data: {
        emertimi,
        logoja,
        website,
        niveli_sponsorizimit,
      },
    });

    return res.json({
      message: "Sponsori u përditesua me sukses",
      sponsor: updatedSponsor,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Sponsori nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete sponsors.",
      });
    }

    await db.sponsors.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Sponsori eshte fshire me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Sponsori nuk u fshi me sukses!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
};
