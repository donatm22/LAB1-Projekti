class Tickets {
  constructor({
    id = null,
    event_id = null,
    tipi = null,
    cmimi = null,
    sasia = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.tipi = tipi;
    this.cmimi = cmimi;
    this.sasia = sasia;
  }
}

module.exports = Tickets;
