const db = require("../config/prisma");
const {
  isNonEmptyString,
  toPositiveInteger,
  toPositiveNumber,
  trimString,
} = require("../utils/validation");

const isAdmin = (req) => req.user?.roli === "admin";

const parseBoolean = (value) => {
  if (value === undefined) return null;
  const normalized = trimString(value).toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return null;
};

const parseNumberFilter = (value) => {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const buildTicketWhere = (query = {}) => {
  const where = {};
  const eventId = trimString(query.eventId || query.event_id);
  const type = trimString(query.type || query.tipi);
  const minPrice = parseNumberFilter(query.minPrice);
  const maxPrice = parseNumberFilter(query.maxPrice);
  const available = parseBoolean(query.available || query.active);
  const soldOut = parseBoolean(query.soldOut);

  if (eventId) {
    where.event_id = eventId;
  }

  if (type) {
    where.tipi = { contains: type, mode: "insensitive" };
  }

  if (minPrice !== null || maxPrice !== null) {
    where.cmimi = {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {}),
    };
  }

  if (available === true) {
    where.sasia = { gt: 0 };
  }

  if (soldOut === true) {
    where.sasia = { lte: 0 };
  }

  return where;
};

const serializeTicket = (ticket) => {
  if (!ticket) return null;
  if (Array.isArray(ticket)) return ticket.map(serializeTicket);
  
  return {
    ...ticket,
    sasia: ticket.sasia !== null && ticket.sasia !== undefined ? Number(ticket.sasia) : null
  };
};

const verifyEventWriteAccess = async (req, eventId) => {
  if (isAdmin(req)) return true;

  try {
    const eventRecord = await db.events.findFirst({
      where: {
        id: eventId,
        organizer_id: req.user?.id,
      },
      select: { id: true },
    });
    return !!eventRecord;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getTickets = async (req, res) => {
  try {
    const tickets = await db.tickets.findMany({
      where: buildTicketWhere(req.query),
      orderBy: { id: "asc" },
    });
    return res.json(serializeTicket(tickets));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getTicketByID = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await db.tickets.findUnique({
      where: { id: id },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Bileta nuk u gjet" });
    }

    return res.json(serializeTicket(ticket));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { event_id, tipi, cmimi, sasia } = req.body;

    if (!event_id || !tipi || !cmimi || !sasia) {
      return res.status(400).json({ message: "Te dhenat nuk u vendosen" });
    }

    const parsedPrice = toPositiveNumber(cmimi);
    const parsedQuantity = toPositiveInteger(sasia);
    if (!isNonEmptyString(tipi) || !parsedPrice || !parsedQuantity) {
      return res.status(400).json({
        message: "Tipi duhet te jete tekst, cmimi numer pozitiv dhe sasia numer pozitiv",
      });
    }

    const allowed = await verifyEventWriteAccess(req, event_id);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const newTicket = await db.tickets.create({
      data: {
        event_id,
        tipi: trimString(tipi),
        cmimi: parsedPrice,
        sasia: BigInt(parsedQuantity),
      },
    });

    return res.status(201).json({
      message: "Bileta u shtua me sukses",
      ticket: serializeTicket(newTicket),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, tipi, cmimi, sasia } = req.body;

    if (!event_id || !tipi || !cmimi || !sasia) {
      return res.status(400).json({ message: "Te dhenat nuk jane vendosur" });
    }

    const parsedPrice = toPositiveNumber(cmimi);
    const parsedQuantity = toPositiveInteger(sasia);
    if (!isNonEmptyString(tipi) || !parsedPrice || !parsedQuantity) {
      return res.status(400).json({
        message: "Tipi duhet te jete tekst, cmimi numer pozitiv dhe sasia numer pozitiv",
      });
    }

    const allowed = await verifyEventWriteAccess(req, event_id);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build row-level condition mapping rules
    const whereClause = { id: id };
    if (!isAdmin(req)) {
      whereClause.Events = {
        organizer_id: req.user?.id,
      };
    }

    const updateSummary = await db.tickets.updateMany({
      where: whereClause,
      data: {
        event_id,
        tipi: trimString(tipi),
        cmimi: parsedPrice,
        sasia: BigInt(parsedQuantity),
      },
    });

    if (updateSummary.count === 0) {
      return res.status(404).json({ message: "Bileta nuk u gjet" });
    }

    const updatedTicket = await db.tickets.findUnique({ where: { id: id } });

    return res.status(200).json({
      message: "Bileta u perditesua me sukses",
      ticket: serializeTicket(updatedTicket),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizerUser = req.user?.roli === "organizer";

    if (isOrganizerUser) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete tickets.",
      });
    }

    await db.tickets.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Bileta eshte fshire me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Bileta nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTickets,
  getTicketByID,
  createTicket,
  updateTicket,
  deleteTicket,
};
