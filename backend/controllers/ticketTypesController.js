const db = require("../../database/db");

const serializeTicketType = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) return data.map((item) => serializeTicketType(item));

  return {
    ...data,
    cmimi: data.cmimi !== null && data.cmimi !== undefined ? Number(data.cmimi) : null,
    sasia_total: data.sasia_total !== null && data.sasia_total !== undefined ? Number(data.sasia_total) : null,
    sasia_mbetur: data.sasia_mbetur !== null && data.sasia_mbetur !== undefined ? Number(data.sasia_mbetur) : null,
  };
};

const getTicketTypes = async (req, res) => {
  try {
    const ticketTypes = await db.ticketTypes.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(serializeTicketType(ticketTypes));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getTicketTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticketType = await db.ticketTypes.findUnique({
      where: { id: id },
    });

    if (!ticketType) {
      return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
    }

    return res.json(serializeTicketType(ticketType));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createTicketType = async (req, res) => {
  try {
    const { event_id, emri_llojit, pershkrimi, cmimi, sasia_total, sasia_mbetur, statusi } = req.body;

    const newTicketType = await db.ticketTypes.create({
      data: {
        event_id: event_id || null,
        emri_llojit: emri_llojit || null,
        pershkrimi: pershkrimi || null,
        cmimi: cmimi !== undefined ? cmimi : null,
        sasia_total: sasia_total !== undefined ? BigInt(sasia_total) : null,
        sasia_mbetur: sasia_mbetur !== undefined ? BigInt(sasia_mbetur) : null,
        statusi: statusi || null,
      },
    });

    return res.status(201).json({
      message: "Lloji i biletës u shtua me sukses",
      ticketType: serializeTicketType(newTicketType),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, emri_llojit, pershkrimi, cmimi, sasia_total, sasia_mbetur, statusi } = req.body;

    const updatedTicketType = await db.ticketTypes.update({
      where: { id: id },
      data: {
        event_id: event_id !== undefined ? event_id : undefined,
        emri_llojit: emri_llojit !== undefined ? emri_llojit : undefined,
        pershkrimi: pershkrimi !== undefined ? pershkrimi : undefined,
        cmimi: cmimi !== undefined ? cmimi : undefined,
        sasia_total: sasia_total !== undefined ? BigInt(sasia_total) : undefined,
        sasia_mbetur: sasia_mbetur !== undefined ? BigInt(sasia_mbetur) : undefined,
        statusi: statusi !== undefined ? statusi : undefined,
      },
    });

    return res.json({
      message: "Lloji i biletës u perditesua me sukses",
      ticketType: serializeTicketType(updatedTicketType),
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete ticket types.",
      });
    }

    await db.ticketTypes.delete({
      where: { id: id },
    });

    return res.json({ message: "Lloji i biletës u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Lloji i biletës nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType,
};