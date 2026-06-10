const db = require("../config/prisma");

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";

const verifyRegistrationWriteAccess = async (req, registrationId) => {
  if (isAdmin(req)) return true;

  try {
    const registration = await db.registrations.findFirst({
      where: {
        id: registrationId,
        Events: {
          organizer_id: req.user?.id,
        },
      },
      select: { id: true },
    });
    return !!registration;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getPayments = async (req, res) => {
  try {
    const whereClause = isOrganizer(req)
      ? {
          Registrations: {
            Events: {
              organizer_id: req.user?.id,
            },
          },
        }
      : {};

    const payments = await db.payments.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });

    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getPaymentsById = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id: id };
    if (!isAdmin(req)) {
      whereClause.Registrations = {
        Events: {
          organizer_id: req.user?.id,
        },
      };
    }

    const payment = await db.payments.findFirst({
      where: whereClause,
    });

    if (!payment) {
      return res.status(404).json({ message: "Pagesa e eventit nuk u gjet" });
    }

    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const { registration_id, shuma, metoda, data, statusi } = req.body;
    if (!registration_id || !shuma || !metoda || !data || !statusi) {
      return res.status(400).json({ message: "Pagesa nuk eshte plotesuar!" });
    }

    const allowed = await verifyRegistrationWriteAccess(req, registration_id);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const newPayment = await db.payments.create({
      data: {
        registration_id,
        shuma,
        metoda,
        data: new Date(data),
        statusi,
      },
    });

    return res.status(201).json({
      message: "Pagesa u shtua me sukses!",
      payments: newPayment,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { registration_id, shuma, metoda, data, statusi } = req.body;
    if (!registration_id || !shuma || !metoda || !data || !statusi) {
      return res.status(400).json({ message: "Input jo valid!" });
    }

    const allowed = await verifyRegistrationWriteAccess(req, registration_id);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }


    const whereClause = { id: id };
    if (!isAdmin(req)) {
      whereClause.Registrations = {
        Events: {
          organizer_id: req.user?.id,
        },
      };
    }

    const updateSummary = await db.payments.updateMany({
      where: whereClause,
      data: {
        registration_id,
        shuma,
        metoda,
        data: new Date(data),
        statusi,
      },
    });

    if (updateSummary.count === 0) {
      return res.status(404).json({ message: "Nuk u shtua Pagesa e perditesuar!" });
    }

    return res.status(200).json({
      message: "Pagesa u perditesua me sukses",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deletePayments = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id: id };
    if (!isAdmin(req)) {
      whereClause.Registrations = {
        Events: {
          organizer_id: req.user?.id,
        },
      };
    }

    const deleteSummary = await db.payments.deleteMany({
      where: whereClause,
    });

    if (deleteSummary.count === 0) {
      return res.status(404).json({ message: "Pagesa nuk u fshi me sukses!" });
    }

    return res.status(200).json({ message: "Pagesa eshte fshire me sukses" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPayments,
  getPaymentsById,
  createPayment,
  updatePayment,
  deletePayments,
};
