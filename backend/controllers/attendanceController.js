const db = require("../config/prisma");

const getAttendance = async (req, res) => {
  try {
    const records = await db.attendance.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await db.attendance.findUnique({
      where: { id: id },
    });

    if (!record) {
      return res.status(404).json({ message: "Attendance nuk u gjet" });
    }

    return res.json(record);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createAttendance = async (req, res) => {
  try {
    const { registration_id, event_id, user_id, check_in_time, check_out_time, statusi_checkin } = req.body;

    const newRecord = await db.attendance.create({
      data: {
        registration_id: registration_id || null,
        event_id: event_id || null,
        user_id: user_id || null,
        check_in_time: check_in_time ? new Date(check_in_time) : null,
        check_out_time: check_out_time ? new Date(check_out_time) : null,
        statusi_checkin: statusi_checkin || null,
      },
    });

    return res.status(201).json({
      message: "Attendance u shtua me sukses",
      attendance: newRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { registration_id, event_id, user_id, check_in_time, check_out_time, statusi_checkin } = req.body;

    const updatedRecord = await db.attendance.update({
      where: { id: id },
      data: {
        registration_id: registration_id,
        event_id: event_id,
        user_id: user_id,
        check_in_time: check_in_time ? new Date(check_in_time) : null,
        check_out_time: check_out_time ? new Date(check_out_time) : null,
        statusi_checkin: statusi_checkin,
      },
    });

    return res.json({
      message: "Attendance u perditesua me sukses",
      attendance: updatedRecord,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Attendance nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    await db.attendance.delete({
      where: { id: id },
    });

    return res.json({ message: "Attendance u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Attendance nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
