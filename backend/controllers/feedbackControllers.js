const db = require("../../database/db");

const serializeFeedback = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) return data.map(item => serializeFeedback(item));
  
  return {
    ...data,
    vleresimi: data.vleresimi !== null && data.vleresimi !== undefined ? Number(data.vleresimi) : null
  };
};

const getFeedbacks = async (req, res) => {
  try {
    const results = await db.feedback.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(serializeFeedback(results));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await db.feedback.findUnique({
      where: { id: id },
    });

    if (!record) {
      return res.status(404).json({ message: "Feedback nuk u gjet" });
    }

    return res.json(serializeFeedback(record));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getFeedbackByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    const results = await db.feedback.findMany({
      where: { event_id: event_id },
      orderBy: { data: "desc" },
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "Nuk ka feedback per kete ngjarje" });
    }

    return res.json(serializeFeedback(results));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { event_id, user_id, vleresimi, komenti } = req.body;

    if (!event_id || !user_id || !vleresimi) {
      return res.status(400).json({ message: "Ploteso event_id, user_id dhe vleresimi" });
    }

    const ratingNum = Number(vleresimi);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Vleresimi duhet te jete ndermjet 1 dhe 5" });
    }

    const newRecord = await db.feedback.create({
      data: {
        event_id: event_id,
        user_id: user_id,
        vleresimi: ratingNum,
        komenti: komenti || null,
        data: new Date(),
      },
    });

    return res.status(201).json({
      message: "Feedback u shtua me sukses",
      feedback: serializeFeedback(newRecord),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { vleresimi, komenti } = req.body;

    if (!vleresimi) {
      return res.status(400).json({ message: "Ploteso vleresimi" });
    }

    const ratingNum = Number(vleresimi);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Vleresimi duhet te jete ndermjet 1 dhe 5" });
    }

    const updatedRecord = await db.feedback.update({
      where: { id: id },
      data: {
        vleresimi: ratingNum,
        komenti: komenti,
      },
    });

    return res.json({
      message: "Feedback u perditesua me sukses",
      feedback: serializeFeedback(updatedRecord),
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Feedback nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    await db.feedback.delete({
      where: { id: id },
    });

    return res.json({ message: "Feedback u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Feedback nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getFeedbacks,
  getFeedbackById,
  getFeedbackByEvent,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};