class TicketTypes {
  constructor({
    id = null,
    event_id = null,
    emri_llojit = null,
    pershkrimi = null,
    cmimi = null,
    sasia_total = null,
    sasia_mbetur = null,
    statusi = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.emri_llojit = emri_llojit;
    this.pershkrimi = pershkrimi;
    this.cmimi = cmimi;
    this.sasia_total = sasia_total;
    this.sasia_mbetur = sasia_mbetur;
    this.statusi = statusi;
    this.created_at = created_at;
  }
}

module.exports = TicketTypes;
