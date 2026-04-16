class Organizers {
  constructor({
    id = null,
    emri_organizates = null,
    pershkrimi = null,
    email = null,
    telefoni = null,
    website = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.emri_organizates = emri_organizates;
    this.pershkrimi = pershkrimi;
    this.email = email;
    this.telefoni = telefoni;
    this.website = website;
    this.created_at = created_at;
  }
}

module.exports = Organizers;
