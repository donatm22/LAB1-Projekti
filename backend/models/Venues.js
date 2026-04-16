class Venues {
  constructor({
    id = null,
    emri = null,
    adresa = null,
    qyteti = null,
    kapaciteti = null,
    pershkrimi = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.emri = emri;
    this.adresa = adresa;
    this.qyteti = qyteti;
    this.kapaciteti = kapaciteti;
    this.pershkrimi = pershkrimi;
    this.created_at = created_at;
  }
}

module.exports = Venues;
