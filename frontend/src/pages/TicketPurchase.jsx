import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { emailApi, eventCategoriesApi, eventsApi, tokenStorage } from "../services/api";
import { mapApiEventToCard } from "../utils/eventMapper";
import "./TicketPurchase.css";

const ticketOptions = [
  {
    id: "standard",
    name: "Standard Entry",
    section: "General Admission",
    price: 35,
    note: "Best value",
    delivery: "Mobile ticket",
  },
  {
    id: "reserved",
    name: "Reserved Seat",
    section: "Lower Bowl",
    price: 62,
    note: "Seats together",
    delivery: "Instant delivery",
  },
  {
    id: "vip",
    name: "VIP Experience",
    section: "Front Section",
    price: 120,
    note: "Limited availability",
    delivery: "Mobile ticket",
  },
];

const anymaSectionOptions = [
  {
    id: "floor-f1",
    label: "F1",
    level: "Floor",
    ticketId: "vip",
    price: 160,
    available: 74,
    style: { left: "39.6%", top: "35.7%", width: "10.2%", height: "8.1%" },
  },
  {
    id: "floor-f2",
    label: "F2",
    level: "Floor",
    ticketId: "vip",
    price: 165,
    available: 58,
    style: { left: "50.1%", top: "35.7%", width: "11.3%", height: "8.1%" },
  },
  {
    id: "floor-f3",
    label: "F3",
    level: "Floor",
    ticketId: "vip",
    price: 155,
    available: 61,
    style: { left: "61.7%", top: "35.7%", width: "9.8%", height: "8.1%" },
  },
  {
    id: "floor-f4",
    label: "F4",
    level: "Floor",
    ticketId: "vip",
    price: 145,
    available: 96,
    style: { left: "40.5%", top: "44.4%", width: "11.1%", height: "11.8%" },
  },
  {
    id: "floor-f5",
    label: "F5",
    level: "Floor",
    ticketId: "vip",
    price: 145,
    available: 83,
    style: { left: "51.7%", top: "44.4%", width: "9.8%", height: "11.8%" },
  },
  {
    id: "floor-f6",
    label: "F6",
    level: "Floor",
    ticketId: "vip",
    price: 135,
    available: 112,
    style: { left: "39.7%", top: "56.7%", width: "11.5%", height: "7.8%" },
  },
  {
    id: "floor-f7",
    label: "F7",
    level: "Floor",
    ticketId: "vip",
    price: 135,
    available: 118,
    style: { left: "50.3%", top: "56.7%", width: "11.1%", height: "7.8%" },
  },
  {
    id: "floor-f8",
    label: "F8",
    level: "Floor",
    ticketId: "vip",
    price: 130,
    available: 105,
    style: { left: "61.7%", top: "56.7%", width: "9.8%", height: "7.8%" },
  },
  {
    id: "lower-102",
    label: "102",
    level: "Lower Level",
    ticketId: "reserved",
    price: 98,
    available: 44,
    style: { left: "41%", top: "25.8%", width: "7.2%", height: "8.7%" },
  },
  {
    id: "lower-103",
    label: "103",
    level: "Lower Level",
    ticketId: "reserved",
    price: 104,
    available: 38,
    style: { left: "48.4%", top: "25.8%", width: "7.3%", height: "8.7%" },
  },
  {
    id: "lower-104",
    label: "104",
    level: "Lower Level",
    ticketId: "reserved",
    price: 104,
    available: 41,
    style: { left: "55.9%", top: "25.8%", width: "7.4%", height: "8.7%" },
  },
  {
    id: "lower-108",
    label: "108",
    level: "Lower Level",
    ticketId: "reserved",
    price: 88,
    available: 52,
    style: { left: "76.2%", top: "38.5%", width: "7.5%", height: "7%" },
  },
  {
    id: "lower-115",
    label: "115",
    level: "Lower Level",
    ticketId: "reserved",
    price: 92,
    available: 49,
    style: { left: "55.4%", top: "65.9%", width: "7.6%", height: "8%" },
  },
  {
    id: "lower-116",
    label: "116",
    level: "Lower Level",
    ticketId: "reserved",
    price: 92,
    available: 47,
    style: { left: "48.1%", top: "65.9%", width: "7%", height: "8%" },
  },
  {
    id: "upper-203",
    label: "203",
    level: "Upper Level",
    ticketId: "standard",
    price: 70,
    available: 126,
    style: { left: "40.4%", top: "15.5%", width: "8%", height: "7.7%" },
  },
  {
    id: "upper-205",
    label: "205",
    level: "Upper Level",
    ticketId: "standard",
    price: 72,
    available: 118,
    style: { left: "55.6%", top: "15.4%", width: "7.1%", height: "7.8%" },
  },
  {
    id: "upper-208",
    label: "208",
    level: "Upper Level",
    ticketId: "standard",
    price: 62,
    available: 132,
    style: { left: "79.7%", top: "23.4%", width: "6.7%", height: "10.4%" },
  },
  {
    id: "upper-218",
    label: "218",
    level: "Upper Level",
    ticketId: "standard",
    price: 68,
    available: 141,
    style: { left: "51%", top: "76.7%", width: "6.7%", height: "8.2%" },
  },
  {
    id: "upper-224",
    label: "224",
    level: "Upper Level",
    ticketId: "standard",
    price: 60,
    available: 99,
    style: { left: "21.1%", top: "47.1%", width: "5%", height: "9.2%" },
  },
  {
    id: "balcony-304",
    label: "304",
    level: "Balcony",
    ticketId: "standard",
    price: 42,
    available: 188,
    style: { left: "48.7%", top: "5.5%", width: "6.8%", height: "7.1%" },
  },
  {
    id: "balcony-310",
    label: "310",
    level: "Balcony",
    ticketId: "standard",
    price: 38,
    available: 205,
    style: { left: "89.1%", top: "28.3%", width: "5%", height: "11.5%" },
  },
  {
    id: "balcony-318",
    label: "318",
    level: "Balcony",
    ticketId: "standard",
    price: 40,
    available: 196,
    style: { left: "51.6%", top: "87.6%", width: "6.5%", height: "5.6%" },
  },
  {
    id: "balcony-325",
    label: "325",
    level: "Balcony",
    ticketId: "standard",
    price: 36,
    available: 211,
    style: { left: "16.4%", top: "40.5%", width: "4.5%", height: "10.5%" },
  },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const createTicketCode = () =>
  `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const LETTERS_ONLY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

function TicketPurchase() {
  const { id } = useParams();
  const [apiEvent, setApiEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(id?.startsWith("db-"));
  const event = apiEvent;
  const [selectedTicketId, setSelectedTicketId] = useState("standard");
  const [selectedSectionId, setSelectedSectionId] = useState("floor-f2");
  const [quantity, setQuantity] = useState(1);
  const [currentUser] = useState(() => tokenStorage.getUser());
  const [checkout, setCheckout] = useState({
    name: currentUser?.emri || "",
    email: currentUser?.email || "",
    phone: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const isAdmin = currentUser?.roli === "admin";

  useEffect(() => {
    if (!id?.startsWith("db-")) {
      Promise.resolve().then(() => {
        setApiEvent(null);
        setLoadingEvent(false);
      });
      return;
    }

    let isMounted = true;
    const backendId = id.replace("db-", "");

    Promise.resolve().then(() => {
      if (isMounted) {
        setLoadingEvent(true);
      }
    });

    Promise.all([eventsApi.getById(backendId), eventCategoriesApi.getAll()])
      .then(([eventData, categories]) => {
        if (!isMounted) {
          return;
        }

        setApiEvent(
          mapApiEventToCard(eventData, Array.isArray(categories) ? categories : [])
        );
      })
      .catch((error) => {
        console.error("Failed to load event:", error);
        if (isMounted) {
          setApiEvent(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingEvent(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isAnymaEvent = event?.speaker?.toLowerCase() === "anyma";
  const selectedSection = useMemo(
    () =>
      anymaSectionOptions.find((section) => section.id === selectedSectionId),
    [selectedSectionId]
  );

  const selectedTicket = useMemo(() => {
    if (isAnymaEvent && selectedSection) {
      return {
        id: selectedSection.ticketId,
        name: `${selectedSection.level} ${selectedSection.label}`,
        section: selectedSection.level,
        price: selectedSection.price,
        note: `${selectedSection.available} available`,
        delivery: "Mobile ticket",
      };
    }

    return ticketOptions.find((ticket) => ticket.id === selectedTicketId);
  }, [isAnymaEvent, selectedSection, selectedTicketId]);

  const totals = useMemo(() => {
    const subtotal = selectedTicket.price * quantity;
    const serviceFee = subtotal * 0.12;
    const deliveryFee = 3.95;
    const total = subtotal + serviceFee + deliveryFee;

    return { subtotal, serviceFee, deliveryFee, total };
  }, [selectedTicket, quantity]);

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "name" || name === "cardName") {
      nextValue = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-.]/g, "");
    }

    if (name === "phone") {
      nextValue = value.replace(/[^\d+\s()-]/g, "");
    }

    if (name === "cardNumber") {
      nextValue = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }

    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }

    if (name === "cvc") {
      nextValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCheckout((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  if (loadingEvent) {
    return (
      <div>
        <Navbar />
        <main className="ticket-empty">
          <h1>Loading event...</h1>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Navbar />
        <main className="ticket-empty">
          <h1>Event not found</h1>
          <Link to="/home">Go back home</Link>
        </main>
      </div>
    );
  }

  const handlePurchase = async (e) => {
    e.preventDefault();
    setCheckoutMessage("");
    setTicketCode("");

    if (!currentUser) {
      setCheckoutStatus("error");
      setCheckoutMessage("Please log in before buying a ticket.");
      return;
    }

    if (isAdmin) {
      setCheckoutStatus("error");
      setCheckoutMessage("Admins cannot purchase tickets.");
      return;
    }

    if (!checkout.name || !currentUser.email || !checkout.cardName) {
      setCheckoutStatus("error");
      setCheckoutMessage("Please fill in your name and cardholder name.");
      return;
    }

    if (!LETTERS_ONLY_REGEX.test(checkout.name.trim()) || !LETTERS_ONLY_REGEX.test(checkout.cardName.trim())) {
      setCheckoutStatus("error");
      setCheckoutMessage("Name fields can contain only letters.");
      return;
    }

    if (checkout.phone && !PHONE_REGEX.test(checkout.phone.trim())) {
      setCheckoutStatus("error");
      setCheckoutMessage("Phone number is not valid.");
      return;
    }

    if (checkout.cardNumber.replace(/\s/g, "").length !== 16) {
      setCheckoutStatus("error");
      setCheckoutMessage("Card number must contain 16 digits.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(checkout.expiry)) {
      setCheckoutStatus("error");
      setCheckoutMessage("Expiry must be in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(checkout.cvc)) {
      setCheckoutStatus("error");
      setCheckoutMessage("CVC must contain 3 or 4 digits.");
      return;
    }

    const newTicketCode = createTicketCode();
    const sectionLabel = isAnymaEvent
      ? `${selectedSection.level} ${selectedSection.label}`
      : selectedTicket.section;

    const emailPayload = {
      buyerName: checkout.name.trim(),
      buyerPhone: checkout.phone || "Not provided",
      ticketCode: newTicketCode,
      eventTitle: event.title,
      eventSpeaker: event.speaker,
      eventLocation: event.location,
      eventDate: event.date,
      ticketType: selectedTicket.name,
      ticketSection: sectionLabel,
      ticketQuantity: quantity,
      orderTotal: formatPrice(totals.total),
    };

    try {
      setCheckoutStatus("sending");
      await emailApi.sendTicketPurchase(emailPayload);
      setTicketCode(newTicketCode);
      setCheckoutStatus("success");
      setCheckoutMessage(
        `Ticket sent to ${currentUser.email}. Your ticket code is ${newTicketCode}.`
      );
    } catch (error) {
      console.error("Ticket purchase email error:", error);
      const errorMessage = error?.message || error?.text || "Unknown error";
      setCheckoutStatus("error");
      setCheckoutMessage(
        `Checkout saved, but the ticket email could not be sent. Error: ${errorMessage}`
      );
    }
  };

  return (
    <div className="ticket-page">
      <Navbar />

      <main>
        <section className="ticket-hero">
          <img src={event.image} alt={event.title} className="ticket-hero-image" />
          <div className="ticket-hero-content">
            <Link to="/home" className="ticket-back-link">
              Back to events
            </Link>
            <p className="ticket-category">{event.category}</p>
            <h1>{event.title}</h1>
            <p className="ticket-meta">
              {event.speaker} · {event.location} · {event.date}
            </p>
          </div>
        </section>

        <section className="ticket-layout">
          <div className="ticket-main">
            <div className="ticket-toolbar">
              <div>
                <p className="ticket-step">Step 1 of 2</p>
                <h2>Choose your tickets</h2>
              </div>
              <label className="quantity-control">
                Quantity
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isAnymaEvent ? (
              <div className="arena-selector">
                <div
                  className="arena-map-shell"
                  aria-label="Anyma arena section map"
                >
                  <img
                    src="/seating/anyma-arena.png"
                    alt="Anyma arena seating sections"
                    className="arena-map-image"
                  />
                  {anymaSectionOptions.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`arena-hotspot ${
                        selectedSectionId === section.id ? "selected" : ""
                      }`}
                      style={section.style}
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        setSelectedTicketId(section.ticketId);
                      }}
                      aria-label={`Select section ${section.label}, ${section.level}, ${formatPrice(
                        section.price
                      )}`}
                    >
                      <span>{section.label}</span>
                    </button>
                  ))}
                </div>

                <div className="selected-section-panel">
                  <span>{selectedSection.level}</span>
                  <strong>Section {selectedSection.label}</strong>
                  <p>
                    {formatPrice(selectedSection.price)} each ·{" "}
                    {selectedSection.available} available
                  </p>
                </div>
              </div>
            ) : (
              <div className="venue-map" aria-label="Venue section preview">
                <div className="stage">Stage</div>
                <button
                  className={`venue-section ${
                    selectedTicketId === "vip" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTicketId("vip")}
                >
                  Front
                </button>
                <button
                  className={`venue-section ${
                    selectedTicketId === "reserved" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTicketId("reserved")}
                >
                  Lower
                </button>
                <button
                  className={`venue-section ${
                    selectedTicketId === "standard" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTicketId("standard")}
                >
                  General
                </button>
              </div>
            )}

            <div className="ticket-list">
              {(isAnymaEvent
                ? anymaSectionOptions
                    .filter(
                      (section, index, sections) =>
                        sections.findIndex(
                          (item) => item.level === section.level
                        ) === index
                    )
                    .map((section) => ({
                      id: section.level,
                      name: section.level,
                      section: "Choose a section from the arena map",
                      price: section.price,
                      note: `From ${formatPrice(section.price)}`,
                      delivery: "Mobile ticket",
                    }))
                : ticketOptions
              ).map((ticket) => (
                <button
                  key={ticket.id}
                  className={`ticket-option ${
                    isAnymaEvent
                      ? selectedSection?.level === ticket.name
                        ? "selected"
                        : ""
                      : selectedTicketId === ticket.id
                        ? "selected"
                        : ""
                  }`}
                  onClick={() => {
                    if (isAnymaEvent) {
                      const section = anymaSectionOptions.find(
                        (item) => item.level === ticket.name
                      );
                      setSelectedSectionId(section.id);
                      setSelectedTicketId(section.ticketId);
                      return;
                    }

                    setSelectedTicketId(ticket.id);
                  }}
                >
                  <span>
                    <strong>{ticket.name}</strong>
                    <small>{ticket.section}</small>
                    <em>{ticket.delivery}</em>
                  </span>
                  <span className="ticket-price-block">
                    <small>{ticket.note}</small>
                    <strong>{formatPrice(ticket.price)}</strong>
                    <em>each</em>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside className="order-summary">
            <p className="summary-label">Order summary</p>
            <h2>{event.title}</h2>

            <div className="summary-ticket">
              <strong>{selectedTicket.name}</strong>
              <span>
                {quantity} x {formatPrice(selectedTicket.price)}
              </span>
            </div>

            <div className="summary-lines">
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(totals.subtotal)}</strong>
              </p>
              <p>
                <span>Service fee</span>
                <strong>{formatPrice(totals.serviceFee)}</strong>
              </p>
              <p>
                <span>Delivery</span>
                <strong>{formatPrice(totals.deliveryFee)}</strong>
              </p>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(totals.total)}</strong>
            </div>

            <form className="checkout-form" onSubmit={handlePurchase}>
              <div className="checkout-section">
                <h3>Delivery</h3>
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={checkout.name}
                    onChange={handleCheckoutChange}
                    placeholder="Filan Fisteku"
                    required
                    pattern={LETTERS_ONLY_REGEX.source}
                  />
                </label>
                <label>
                  Email for ticket
                  <input
                    type="email"
                    name="email"
                    value={checkout.email}
                    readOnly
                    placeholder="Login required"
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    value={checkout.phone}
                    onChange={handleCheckoutChange}
                    placeholder="+383 44 000 000"
                    pattern={PHONE_REGEX.source}
                  />
                </label>
              </div>

              <div className="checkout-section">
                <h3>Payment</h3>
                <label>
                  Cardholder name
                  <input
                    type="text"
                    name="cardName"
                    value={checkout.cardName}
                    onChange={handleCheckoutChange}
                    placeholder="Filan Fisteku"
                    required
                    pattern={LETTERS_ONLY_REGEX.source}
                  />
                </label>
                <label>
                  Card number
                  <input
                    type="text"
                    name="cardNumber"
                    value={checkout.cardNumber}
                    onChange={handleCheckoutChange}
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    required
                  />
                </label>
                <div className="checkout-row">
                  <label>
                    Expiry
                    <input
                      type="text"
                      name="expiry"
                      value={checkout.expiry}
                      onChange={handleCheckoutChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  </label>
                  <label>
                    CVC
                    <input
                      type="text"
                      name="cvc"
                      value={checkout.cvc}
                      onChange={handleCheckoutChange}
                      inputMode="numeric"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  </label>
                </div>
              </div>

              <button
                className="checkout-button"
                type="submit"
                disabled={checkoutStatus === "sending" || isAdmin}
              >
                {isAdmin ? "Admins cannot purchase tickets" : checkoutStatus === "sending" ? "Sending ticket..." : "Pay and email ticket"}
              </button>
            </form>

            {checkoutMessage && (
              <p className={`checkout-message ${checkoutStatus}`}>
                {checkoutMessage}
              </p>
            )}

            {ticketCode && (
              <div className="ticket-confirmation">
                <span>Ticket code</span>
                <strong>{ticketCode}</strong>
              </div>
            )}

            <p className="summary-note">
              Ticket confirmation is sent with Resend to the email on your logged-in account.
              Replace this demo checkout with a payment provider before accepting real cards.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default TicketPurchase;
