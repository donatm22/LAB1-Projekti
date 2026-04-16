class EventSpeakers {
  constructor({
    id = null,
    event_id = null,
    speaker_id = null,
    tema = null,
    ora = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.speaker_id = speaker_id;
    this.tema = tema;
    this.ora = ora;
  }
}

module.exports = EventSpeakers;
