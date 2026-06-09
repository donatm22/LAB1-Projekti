const db = require("../../database/db");
const crypto = require("crypto");
const { buildPDF, generateTicketQR } = require("../services/ticketService");
const { createNotification } = require("../services/notificationService");
const {
  sendBookingConfirmation,
  sendBookingCancellation,
} = require("../services/bookingEmailService");

const isAdmin = (req) => req.user?.roli === "admin";
const isOrganizer = (req) => req.user?.roli === "organizer";
const isOwner = (req, userId) => String(req.user?.id) === String(userId);

const userCanAccessRegistration = (req, registration) =>
  isAdmin(req) ||
  isOwner(req, registration.user_id) ||
  (isOrganizer(req) && String(req.user?.id) === String(registration.Events?.organizer_id));

const getRegistrationDetails = async (id) => {
  const result = await db.registrations.findUnique({
    where: { id: id },
    include: {
      Users: { select: { emri: true, email: true } },
      Events: {
        select: {
          titulli: true,
          data_fillimit: true,
          data_perfundimit: true,
          lokacioni: true,
          organizer_id: true,
        },
      },
      Tickets: { select: { tipi: true, cmimi: true } },
    },
  });

  if (!result) return null;

  return {
    ...result,
    user_name: result.Users?.emri || null,
    user_email: result.Users?.email || null,
    event_name: result.Events?.titulli || null,
    event_start: result.Events?.data_fillimit || null,
    event_end: result.Events?.data_perfundimit || null,
    event_location: result.Events?.lokacioni || null,
    organizer_id: result.Events?.organizer_id || null,
    ticket_type: result.Tickets?.tipi || null,
    ticket_price: result.Tickets?.cmimi || null,
  };
};

const buildQrData = (token) => JSON.stringify({ type: "ticket", token });

const getRegistrations = async (req, res) => {
  try {
    const whereClause = isOrganizer(req)
      ? {
          Events: {
            organizer_id: req.user?.id,
          },
        }
      : {};

    const records = await db.registrations.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });

    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getRegistrationById = async (req, res) => {
  try {
    const registration = await getRegistrationDetails(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    if (!userCanAccessRegistration(req, registration)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(registration);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getRegistrationsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    const targetEvent = await db.events.findUnique({
      where: { id: event_id },
      select: { organizer_id: true },
    });

    if (!targetEvent) {
      return res.status(404).json({ message: "Eventi nuk u gjet" });
    }

    if (isOrganizer(req) && String(targetEvent.organizer_id) !== String(req.user?.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const records = await db.registrations.findMany({
      where: { event_id: event_id },
      orderBy: { data_regjistrimit: "desc" },
    });

    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getRegistrationsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!isAdmin(req) && !isOwner(req, user_id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const records = await db.registrations.findMany({
      where: { user_id: user_id },
      orderBy: { data_regjistrimit: "desc" },
    });

    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createRegistration = async (req, res) => {
  const { event_id, ticket_id } = req.body;
  const user_id = req.user?.id;
  const userRole = req.user?.roli;

  console.log(`[REG] Create registration - User: ${user_id}, Role: ${userRole}, Event: ${event_id}, Ticket: ${ticket_id}`);

  if (!event_id || !ticket_id) {
    return res.status(400).json({ message: "Ploteso event_id dhe ticket_id" });
  }

  if (!user_id) {
    return res.status(401).json({ message: "Perdoruesi nuk eshte i autentikuar" });
  }

  if (userRole === "organizer") {
    console.log(`[REG] Organizer tried to book tickets - DENIED`);
    return res.status(403).json({ message: "Access denied. Organizers cannot book tickets." });
  }

  try {
    const registration = await db.$transaction(async (tx) => {
      const ticket = await tx.tickets.findFirst({
        where: { id: ticket_id, event_id: event_id },
      });

      if (!ticket) {
        throw new Error("404:Bileta nuk u gjet per kete event");
      }

      if (!ticket.sasia || ticket.sasia <= 0n) {
        throw new Error("400:Nuk ka bileta te disponueshme");
      }

      await tx.tickets.update({
        where: { id: ticket_id },
        data: { sasia: ticket.sasia - 1n },
      });

      const qrToken = crypto.randomUUID();

      return await tx.registrations.create({
        data: {
          event_id: event_id,
          user_id: user_id,
          ticket_id: ticket_id,
          statusi: "pending",
          reminder_sent: false,
          qr_token: qrToken,
          qr_data: buildQrData(qrToken),
        },
      });
    });

    res.status(201).json({
      message: "Regjistrimi u krye me sukses",
      registration,
    });

    getRegistrationDetails(registration.id)
      .then((details) => {
        if (!details) return null;
        createNotification({
          userId: user_id,
          title: "Bileta u rezervua",
          message: `Rezervimi per ${details.event_name || "event"} u krijua me sukses.`,
          type: "ticket",
        }).catch((error) => console.error("Error creating notification:", error.message));

        return sendBookingConfirmation({
          userName: details.user_name,
          userEmail: details.user_email,
          eventName: details.event_name,
          eventDate: details.event_start ? new Date(details.event_start).toLocaleString() : "",
          eventLocation: details.event_location,
          bookingId: registration.id,
        });
      })
      .catch((error) => console.error("Error sending confirmation email:", error.message));

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

const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusi } = req.body;

    if (!statusi) {
      return res.status(400).json({ message: "Ploteso statusi" });
    }

    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(statusi)) {
      return res.status(400).json({ message: "Statusi duhet te jete: pending, confirmed ose cancelled" });
    }

    const whereClause = { id: id };
    if (!isAdmin(req)) {
      whereClause.Events = {
        organizer_id: req.user?.id,
      };
    }

    const updateSummary = await db.registrations.updateMany({
      where: whereClause,
      data: { statusi: statusi },
    });

    if (updateSummary.count === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    const updatedRecord = await db.registrations.findUnique({ where: { id: id } });

    return res.json({
      message: "Regjistrimi u perditesua me sukses",
      registration: updatedRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const details = await getRegistrationDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    await db.$transaction(async (tx) => {
      await tx.registrations.delete({
        where: { id: req.params.id },
      });

      const ticket = await tx.tickets.findUnique({
        where: { id: details.ticket_id },
        select: { sasia: true },
      });

      if (ticket) {
        await tx.tickets.update({
          where: { id: details.ticket_id },
          data: { sasia: (ticket.sasia || 0n) + 1n },
        });
      }
    });

    res.json({ message: "Regjistrimi u fshi me sukses" });

    if (details) {
      sendBookingCancellation({
        userName: details.user_name,
        userEmail: details.user_email,
        eventName: details.event_name,
      }).catch((error) => console.error("Error sending cancellation email:", error.message));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getRegistrationPDF = async (req, res) => {
  try {
    const registration = await getRegistrationDetails(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    if (!userCanAccessRegistration(req, registration)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const start = registration.event_start ? new Date(registration.event_start) : null;
    const end = registration.event_end ? new Date(registration.event_end) : null;
    const ticket = {
      ticketId: registration.id,
      qrData: registration.qr_data || registration.qr_token || registration.id,
      eventName: registration.event_name || "Event",
      eventDate: start ? start.toLocaleDateString() : "TBA",
      eventTime: start ? `${start.toLocaleTimeString()}${end ? ` - ${end.toLocaleTimeString()}` : ""}` : "TBA",
      venue: registration.event_location || "TBA",
      attendeeName: registration.user_name || "Attendee",
    };

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${ticket.ticketId}.pdf"`,
    });

    await buildPDF((chunk) => res.write(chunk), () => res.end(), ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getRegistrationQRCode = async (req, res) => {
  try {
    const registration = await getRegistrationDetails(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    if (!userCanAccessRegistration(req, registration)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const qrBuffer = await generateTicketQR(
      registration.qr_data || registration.qr_token || registration.id
    );

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="registration-${registration.id}-qr.png"`,
    });

    return res.end(qrBuffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const verifyRegistrationQRCode = async (req, res) => {
  try {
    const token = req.body?.token || req.query?.token;

    if (!token) {
      return res.status(400).json({ message: "Token mungon" });
    }

    const registration = await db.registrations.findFirst({
      where: { qr_token: token },
      include: {
        Users: { select: { emri: true, email: true } },
        Events: { select: { titulli: true, organizer_id: true, data_fillimit: true } },
        Tickets: { select: { tipi: true } },
      },
    });

    if (!registration) {
      return res.status(404).json({ valid: false, message: "QR code nuk eshte valid" });
    }

    if (
      isOrganizer(req) &&
      String(registration.Events?.organizer_id) !== String(req.user?.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedRegistration = await db.registrations.update({
      where: { id: registration.id },
      data: { qr_verified_at: new Date(), statusi: "confirmed" },
    });

    return res.json({
      valid: true,
      message: "QR code u verifikua",
      registration: {
        ...updatedRegistration,
        attendee_name: registration.Users?.emri || null,
        attendee_email: registration.Users?.email || null,
        event_name: registration.Events?.titulli || null,
        event_start: registration.Events?.data_fillimit || null,
        ticket_type: registration.Tickets?.tipi || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRegistrations,
  getRegistrationById,
  getRegistrationsByEvent,
  getRegistrationsByUser,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getRegistrationPDF,
  getRegistrationQRCode,
  verifyRegistrationQRCode,
};
