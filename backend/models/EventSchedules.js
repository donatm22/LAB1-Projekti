class EventSchedules {
  constructor({
    id = null,
    event_id = null,
    titulli_eventit = null,
    pershkrimi = null,
    ora_fillimit = null,
    ora_mbarimit = null,
    salla = null,
    speaker_id = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.titulli_eventit = titulli_eventit;
    this.pershkrimi = pershkrimi;
    this.ora_fillimit = ora_fillimit;
    this.ora_mbarimit = ora_mbarimit;
    this.salla = salla;
    this.speaker_id = speaker_id;
    this.created_at = created_at;
  }
}

module.exports = EventSchedules;
