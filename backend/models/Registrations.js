class Registrations {
  constructor({
    id = null,
    event_id = null,
    user_id = null,
    ticket_id = null,
    data_regjistrimit = null,
    statusi = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.ticket_id = ticket_id;
    this.data_regjistrimit = data_regjistrimit;
    this.statusi = statusi;
  }
}

module.exports = Registrations;
