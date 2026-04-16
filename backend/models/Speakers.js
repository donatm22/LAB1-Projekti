class Speakers {
  constructor({
    id = null,
    emri = null,
    mbiemri = null,
    biografia = null,
    imazhi = null,
    email = null
  } = {}) {
    this.id = id;
    this.emri = emri;
    this.mbiemri = mbiemri;
    this.biografia = biografia;
    this.imazhi = imazhi;
    this.email = email;
  }
}

module.exports = Speakers;
