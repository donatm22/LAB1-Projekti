class Feedback {
  constructor({
    id = null,
    event_id = null,
    user_id = null,
    vleresimi = null,
    komenti = null,
    data = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.vleresimi = vleresimi;
    this.komenti = komenti;
    this.data = data;
  }
}

module.exports = Feedback;
