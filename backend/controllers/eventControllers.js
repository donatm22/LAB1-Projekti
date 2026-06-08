const db = require("../../database/db");
const {
    isNonEmptyString,
    isValidDateTime,
    toPositiveInteger,
    trimString,
} = require("../utils/validation");

const parseEventImages = (value) => {
    if (Array.isArray(value)) {
        return value.flatMap((item) => parseEventImages(item)).filter(Boolean);
    }
    if (typeof value !== "string") return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item || "").trim()).filter(Boolean);
        }
    } catch {}
    return trimmed.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
};

const serializeEventImages = (images) => {
    const uniqueImages = [...new Set(images.filter(Boolean))];
    if (uniqueImages.length > 10) {
        const error = new Error("You can add up to 10 photos for an event");
        error.statusCode = 400;
        throw error;
    }
    return uniqueImages.length > 0 ? JSON.stringify(uniqueImages) : null;
};

const getUploadedImages = (req) => {
    const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    return files.map((file) => `/uploads/events/${file.filename}`);
};

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";

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

const parseDateFilter = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildEventWhere = (query = {}) => {
    const where = {};
    const search = trimString(query.search || query.q);
    const category = trimString(query.category || query.categoryId);
    const location = trimString(query.location);
    const creator = trimString(query.creator || query.creatorId || query.organizerId);
    const status = trimString(query.status);
    const minPrice = parseNumberFilter(query.minPrice);
    const maxPrice = parseNumberFilter(query.maxPrice);
    const date = parseDateFilter(query.date);
    const upcoming = parseBoolean(query.upcoming);
    const soldOut = parseBoolean(query.soldOut);
    const available = parseBoolean(query.available);

    if (search) {
        where.titulli = { contains: search, mode: "insensitive" };
    }

    if (category && category !== "all") {
        where.OR = [
            { category_id: category },
            { EventCategories: { emri: { equals: category, mode: "insensitive" } } },
        ];
    }

    if (location) {
        where.lokacioni = { contains: location, mode: "insensitive" };
    }

    if (creator) {
        where.organizer_id = creator;
    }

    if (status) {
        where.statusi = { equals: status, mode: "insensitive" };
    }

    if (date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        where.data_fillimit = {
            ...(where.data_fillimit || {}),
            gte: date,
            lt: nextDay,
        };
    }

    if (upcoming === true) {
        where.data_fillimit = {
            ...(where.data_fillimit || {}),
            gte: new Date(),
        };
    }

    if (minPrice !== null || maxPrice !== null) {
        where.Tickets = {
            some: {
                cmimi: {
                    ...(minPrice !== null ? { gte: minPrice } : {}),
                    ...(maxPrice !== null ? { lte: maxPrice } : {}),
                },
            },
        };
    }

    if (available === true) {
        where.Tickets = {
            some: {
                ...(where.Tickets?.some || {}),
                sasia: { gt: 0 },
            },
        };
    }

    if (soldOut === true) {
        where.Tickets = {
            ...(where.Tickets || {}),
            some: where.Tickets?.some || {},
            every: {
                sasia: { lte: 0 },
            },
        };
    }

    return where;
};

const buildEventImages = (req, fallbackImageValue = null) => {
    const uploadedImages = getUploadedImages(req);
    const bodyImages = parseEventImages(req.body.imazhi);
    if (uploadedImages.length > 0 || bodyImages.length > 0) {
        return serializeEventImages([...bodyImages, ...uploadedImages]);
    }
    return fallbackImageValue;
};

const getEvents = async (req, res) => {
  try {
    const where = buildEventWhere(req.query);
    const events = await db.events.findMany({
      where,
      orderBy: {
        data_fillimit: 'asc',
      },
      include: {
        EventCategories: true,
        Tickets: {
          select: {
            cmimi: true,
            sasia: true
          }
        },
        OrganizerUser: {
          select: {
            emri: true,
            roli: true
          }
        }
      }
    });

    const formattedEvents = events.map(event => {
      const isSystemAdmin = event.OrganizerUser?.roli === 'admin';
      return {
        ...event,
        displayOrganizer: isSystemAdmin ? 'AURA Events' : (event.OrganizerUser?.emri || 'Unknown Organizer')
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
    try {
        const { id } = req.params; // Expected to be a String UUID
        const isOrganizerUser = isOrganizer(req);

        const event = await db.events.findUnique({
            where: { id: id },
            include: {
                OrganizerUser: {
                    select: {
                        emri: true,
                        roli: true
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ message: "Eventi nuk u gjet" });
        }

        if (isOrganizerUser && String(event.organizer_id) !== String(req.user.id) && req.query.scope !== "manage") {
            return res.status(403).json({ message: "Access denied" });
        }

        const isSystemAdmin = event.OrganizerUser?.roli === 'admin';
        const formattedEvent = {
            ...event,
            displayOrganizer: isSystemAdmin ? 'AURA Events' : (event.OrganizerUser?.emri || 'Unknown Organizer')
        };

        res.json(formattedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi, category_id } = req.body;

        if (!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !category_id) {
            return res.status(400).json({ message: "Vlerat jane te zbrazeta!" });
        }

        const parsedCapacity = toPositiveInteger(kapaciteti);
        if (!parsedCapacity) {
            return res.status(400).json({ message: "Kapaciteti duhet te jete numer pozitiv" });
        }

        if (!isValidDateTime(data_fillimit) || !isValidDateTime(data_perfundimit)) {
            return res.status(400).json({ message: "Datat e eventit duhet te jene valide" });
        }

        if (new Date(data_perfundimit) < new Date(data_fillimit)) {
            return res.status(400).json({ message: "Data e perfundimit duhet te jete pas dates se fillimit" });
        }

        if (![titulli, pershkrimi, lokacioni, statusi].every(isNonEmptyString)) {
            return res.status(400).json({ message: "Titulli, pershkrimi, lokacioni dhe statusi jane te detyrueshme" });
        }

        const creatorId = isAdmin(req) && req.body.owner_user_id ? req.body.owner_user_id : req.user?.id;
        if (!creatorId) {
            return res.status(401).json({ message: "Ju nuk jeni i autorizuar" });
        }

        const categoryExists = await db.eventCategories.findUnique({ where: { id: category_id } });
        if (!categoryExists) return res.status(400).json({ message: "Category not found" });

        const imageValue = buildEventImages(req);

        const newEvent = await db.events.create({
            data: {
                titulli: trimString(titulli),
                pershkrimi: trimString(pershkrimi),
                data_fillimit: new Date(data_fillimit),
                data_perfundimit: new Date(data_perfundimit),
                lokacioni: trimString(lokacioni),
                kapaciteti: BigInt(parsedCapacity),
                statusi: trimString(statusi),
                organizer_id: creatorId,
                category_id: category_id,
                imazhi: imageValue
            }
        });

        res.status(201).json({ message: "Eventi u shtua me sukses", event: newEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulli, pershkrimi, data_fillimit, data_perfundimit, lokacioni, kapaciteti, statusi, category_id } = req.body;

        if (!titulli || !pershkrimi || !data_fillimit || !data_perfundimit || !lokacioni || !kapaciteti || !statusi || !category_id) {
            return res.status(400).json({ message: "Vlerat jane te zbrazeta!" });
        }

        const parsedCapacity = toPositiveInteger(kapaciteti);
        if (!parsedCapacity) return res.status(400).json({ message: "Kapaciteti duhet te jete numer pozitiv" });

        const existingEvent = await db.events.findUnique({ where: { id: id } });
        if (!existingEvent) return res.status(404).json({ message: "Eventi nuk u gjet" });

        if (isOrganizer(req) && String(existingEvent.organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const creatorId = isAdmin(req) && req.body.owner_user_id ? req.body.owner_user_id : req.user?.id;
        const imageValue = buildEventImages(req, existingEvent.imazhi);

        const updatedEvent = await db.events.update({
            where: { id: id },
            data: {
                titulli: trimString(titulli),
                pershkrimi: trimString(pershkrimi),
                data_fillimit: new Date(data_fillimit),
                data_perfundimit: new Date(data_perfundimit),
                lokacioni: trimString(lokacioni),
                kapaciteti: BigInt(parsedCapacity),
                statusi: trimString(statusi),
                organizer_id: creatorId,
                category_id: category_id,
                imazhi: imageValue
            }
        });

        res.status(200).json({ message: "Eventi u perditesua me sukses", event: updatedEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.events.delete({
            where: { id: id }
        });
        res.json({ message: "Eventi u fshi me sukses" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getManagedEvents = async (req, res) => {
  try {
    const where = buildEventWhere(req.query);

    if (req.user.roli === "organizer") {
      where.organizer_id = req.user.id;
    }

    const events = await db.events.findMany({
      where,
      orderBy: { data_fillimit: "asc" },
      include: {
        EventCategories: true,
        Tickets: {
          select: { cmimi: true, sasia: true }
        },
        OrganizerUser: {
          select: { emri: true, roli: true }
        }
      }
    });

    const formattedEvents = events.map(event => ({
      ...event,
      displayOrganizer: event.OrganizerUser?.roli === "admin"
        ? "AURA Events"
        : (event.OrganizerUser?.emri || "Unknown Organizer")
    }));

    return res.status(200).json(formattedEvents);
  } catch (error) {
    return res.status(500).json({ message: "Gabim gjate marrjes se ngjarjeve te menaxhuara.", error: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getManagedEvents };
