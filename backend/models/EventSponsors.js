class EventSponsors {
  constructor({ id = null, event_id = null, sponsor_id = null, shuma = null } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.sponsor_id = sponsor_id;
    this.shuma = shuma;
  }
}

module.exports = EventSponsors;
