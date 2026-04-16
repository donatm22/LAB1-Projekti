class Sponsors {
  constructor({
    id = null,
    emri = null,
    logoja = null,
    website = null,
    niveli_sponsorizimit = null
  } = {}) {
    this.id = id;
    this.emri = emri;
    this.logoja = logoja;
    this.website = website;
    this.niveli_sponsorizimit = niveli_sponsorizimit;
  }
}

module.exports = Sponsors;
