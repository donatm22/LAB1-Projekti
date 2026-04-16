class Users {
  constructor({
    id = null,
    emri = null,
    email = null,
    password = null,
    roli = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.emri = emri;
    this.email = email;
    this.password = password;
    this.roli = roli;
    this.created_at = created_at;
  }
}

module.exports = Users;
