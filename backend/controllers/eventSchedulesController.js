const db = require("../../database/db");

const getEventSchedules = async (req, res) => {
  try {
    const schedules = await db.eventSchedules.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(schedules);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getEventSchedulesById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await db.eventSchedules.findUnique({
      where: { id: id },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
    }

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createEventSchedules = async (req, res) => {
  try {
    const { event_id, titulli_eventit, pershkrimi, ora_fillimit, ora_mbarimit, salla, speaker_id } = req.body;

    const newSchedule = await db.eventSchedules.create({
      data: {
        event_id: event_id || null,
        titulli_eventit: titulli_eventit || null,
        pershkrimi: pershkrimi || null,
        ora_fillimit: ora_fillimit ? new Date(ora_fillimit) : null,
        ora_mbarimit: ora_mbarimit ? new Date(ora_mbarimit) : null,
        salla: salla || null,
        speaker_id: speaker_id || null,
      },
    });

    return res.status(201).json({
      message: "Orari i eventit u shtua me sukses",
      eventSchedule: newSchedule,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateEventSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id, titulli_eventit, pershkrimi, ora_fillimit, ora_mbarimit, salla, speaker_id } = req.body;

    const updatedSchedule = await db.eventSchedules.update({
      where: { id: id },
      data: {
        event_id: event_id,
        titulli_eventit: titulli_eventit,
        pershkrimi: pershkrimi,
        ora_fillimit: ora_fillimit ? new Date(ora_fillimit) : null,
        ora_mbarimit: ora_mbarimit ? new Date(ora_mbarimit) : null,
        salla: salla,
        speaker_id: speaker_id,
      },
    });

    return res.json({
      message: "Orari i eventit u perditesua me sukses",
      eventSchedule: updatedSchedule,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteEventSchedules = async (req, res) => {
  try {
    const { id } = req.params;

    await db.eventSchedules.delete({
      where: { id: id },
    });

    return res.json({ message: "Orari i eventit u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Orari i eventit nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEventSchedules,
  getEventSchedulesById,
  createEventSchedules,
  updateEventSchedules,
  deleteEventSchedules,
};