class Payments {
  constructor({
    id = null,
    registration_id = null,
    shuma = null,
    metoda = null,
    data = null,
    statusi = null
  } = {}) {
    this.id = id;
    this.registration_id = registration_id;
    this.shuma = shuma;
    this.metoda = metoda;
    this.data = data;
    this.statusi = statusi;
  }
}

module.exports = Payments;
