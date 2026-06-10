const db = require("../config/prisma");

const getEventSpeakers = async (req, res) => {
  try {
    const speakers = await db.event_Speakers.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(speakers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getEventSpeakersById = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await db.event_Speakers.findUnique({
      where: { id: id },
    });

    if (!speaker) {
      return res.status(404).json({ message: "Speaker i eventit nuk u gjet!" });
    }

    return res.json(speaker);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createEventSpeakers = async (req, res) => {
  try {
    const { tema, ora, event_id, speaker_id } = req.body;

    if (!tema || !ora) {
      return res.status(400).json({ message: "Vlerat jane te zbrazeta" });
    }

    const newSpeaker = await db.event_Speakers.create({
      data: {
        tema: tema,
        ora: new Date(ora),
        event_id: event_id || null,
        speaker_id: speaker_id || null,
      },
    });

    return res.status(201).json({
      message: "Speakeri u shtua me sukses",
      eventSpeakers: newSpeaker,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateEventSpeakers = async (req, res) => {
  try {
    const { id } = req.params;
    const { tema, ora, event_id, speaker_id } = req.body;

    if (!tema || !ora) {
      return res.status(400).json({ message: "Vlerat jane te zbrazeta" });
    }

    const updatedSpeaker = await db.event_Speakers.update({
      where: { id: id },
      data: {
        tema: tema,
        ora: new Date(ora),
        event_id: event_id,
        speaker_id: speaker_id,
      },
    });

    return res.status(200).json({
      message: "Speakeri i eventit u perditesua me sukses",
      eventSpeakers: updatedSpeaker,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Speaker i eventit nuk u gjet!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteEventSpeakers = async (req, res) => {
  try {
    const { id } = req.params;

    await db.event_Speakers.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Speakeri i eventit u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Speaker i eventit nuk u gjet!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEventSpeakers,
  getEventSpeakersById,
  createEventSpeakers,
  updateEventSpeakers,
  deleteEventSpeakers,
};
