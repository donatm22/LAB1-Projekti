const db = require("../config/prisma");
const {
  isLettersOnly,
  trimString,
} = require("../utils/validation");

const formatSpeakerResponse = (speaker) => {
  if (!speaker) return null;
  if (Array.isArray(speaker)) return speaker.map(formatSpeakerResponse);

  const { Event_Speakers, ...speakerData } = speaker;
  return {
    ...speakerData,
    event_ids: Event_Speakers ? Event_Speakers.map((es) => es.event_id) : [],
  };
};

const normalizeEventIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getSpeakers = async (req, res) => {
  try {
    const speakers = await db.speakers.findMany({
      include: {
        Event_Speakers: {
          select: { event_id: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return res.json(formatSpeakerResponse(speakers));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getSpeakersById = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await db.speakers.findUnique({
      where: { id: id },
      include: {
        Event_Speakers: {
          select: { event_id: true },
        },
      },
    });

    if (!speaker) {
      return res.status(404).json({ message: "Speaker nuk u gjet" });
    }

    return res.json(formatSpeakerResponse(speaker));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createSpeakers = async (req, res) => {
  try {
    const { emri } = req.body;
    const eventIds = normalizeEventIds(req.body.event_ids);

    if (!emri) {
      return res.status(400).json({ message: "Emri eshte i detyrueshem" });
    }

    if (!isLettersOnly(emri)) {
      return res.status(400).json({ message: "Emri i speaker-it duhet te permbaje vetem shkronja" });
    }

    if (eventIds.length === 0) {
      return res.status(400).json({ message: "Speaker-i duhet te lidhet me te pakten nje event" });
    }

    const newSpeaker = await db.$transaction(async (tx) => {
      const existingEventsCount = await tx.events.count({
        where: { id: { in: eventIds } },
      });

      if (existingEventsCount !== eventIds.length) {
        throw new Error("400:Nje ose me shume evente nuk u gjeten");
      }

      return await tx.speakers.create({
        data: {
          emri: trimString(emri),
          Event_Speakers: {
            create: eventIds.map((eventId) => ({
              event_id: eventId,
            })),
          },
        },
        include: {
          Event_Speakers: { select: { event_id: true } },
        },
      });
    });

    return res.status(201).json({
      message: "Speaker-i u shtua me sukses",
      speaker: formatSpeakerResponse(newSpeaker),
    });
  } catch (err) {
    if (err.message.startsWith("400:")) {
      return res.status(400).json({ message: err.message.replace("400:", "") });
    }
    return res.status(500).json({ error: err.message });
  }
};

const updateSpeakers = async (req, res) => {
  try {
    const { id } = req.params;
    const { emri } = req.body;
    const eventIds = normalizeEventIds(req.body.event_ids);

    if (!emri) {
      return res.status(400).json({ message: "Emri eshte i detyrueshem" });
    }

    if (!isLettersOnly(emri)) {
      return res.status(400).json({ message: "Emri i speaker-it duhet te permbaje vetem shkronja" });
    }

    const updatedSpeaker = await db.$transaction(async (tx) => {
      const currentSpeaker = await tx.speakers.findUnique({ where: { id } });
      if (!currentSpeaker) {
        throw new Error("404:Speaker nuk u gjet");
      }

      const updateData = { emri: trimString(emri) };

      if (eventIds.length > 0) {
        const existingEventsCount = await tx.events.count({
          where: { id: { in: eventIds } },
        });

        if (existingEventsCount !== eventIds.length) {
          throw new Error("400:Nje ose me shume evente nuk u gjeten");
        }

        await tx.event_Speakers.deleteMany({
          where: { speaker_id: id },
        });

        updateData.Event_Speakers = {
          create: eventIds.map((eventId) => ({
            event_id: eventId,
          })),
        };
      }

      return await tx.speakers.update({
        where: { id },
        data: updateData,
        include: {
          Event_Speakers: { select: { event_id: true } },
        },
      });
    });

    return res.status(200).json({
      message: "Speaker-i u perditesua me sukses",
      speaker: formatSpeakerResponse(updatedSpeaker),
    });
  } catch (err) {
    if (err.message.startsWith("404:")) {
      return res.status(404).json({ message: err.message.replace("404:", "") });
    }
    if (err.message.startsWith("400:")) {
      return res.status(400).json({ message: err.message.replace("400:", "") });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteSpeakers = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete speakers.",
      });
    }

    await db.speakers.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Speaker eshte fshire me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Speaker nuk u fshi me sukses!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSpeakers,
  getSpeakersById,
  createSpeakers,
  updateSpeakers,
  deleteSpeakers,
};
