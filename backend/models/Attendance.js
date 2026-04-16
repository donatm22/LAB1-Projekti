class Attendance {
  constructor({
    id = null,
    registration_id = null,
    event_id = null,
    user_id = null,
    check_in_time = null,
    check_out_time = null,
    statusi_checkin = null,
    created_at = null
  } = {}) {
    this.id = id;
    this.registration_id = registration_id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.check_in_time = check_in_time;
    this.check_out_time = check_out_time;
    this.statusi_checkin = statusi_checkin;
    this.created_at = created_at;
  }
}

module.exports = Attendance;
