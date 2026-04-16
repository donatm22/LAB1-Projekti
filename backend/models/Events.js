class Events {
  constructor({
    id = null,
    titulli = null,
    pershkrimi = null,
    data_fillimit = null,
    data_perfundimit = null,
    lokacioni = null,
    kapaciteti = null,
    statusi = null,
    organizer_id = null,
    category_id = null,
    imazhi = null,
    venue_id = null,
    organizer_entity_id = null
  } = {}) {
    this.id = id;
    this.titulli = titulli;
    this.pershkrimi = pershkrimi;
    this.data_fillimit = data_fillimit;
    this.data_perfundimit = data_perfundimit;
    this.lokacioni = lokacioni;
    this.kapaciteti = kapaciteti;
    this.statusi = statusi;
    this.organizer_id = organizer_id;
    this.category_id = category_id;
    this.imazhi = imazhi;
    this.venue_id = venue_id;
    this.organizer_entity_id = organizer_entity_id;
  }
}

module.exports = Events;
