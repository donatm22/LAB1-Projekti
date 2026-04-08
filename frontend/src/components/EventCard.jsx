function EventCard({event}){
    return (
        <div className="event-card">
            <img src={event.imazhi} alt={event.titulli} className= "event-image" />
        
        <div className="event-content">
            <h2>{event.titulli}</h2>
            <p>{event.pershkrimi}</p>
            <p> <strong>Location:</strong> {event.lokacioni}</p>
            <p><strong>Start Date:</strong>{event.data_fillimit}</p>
            <p><strong>End Date:</strong> {event.data_perfundimit}</p>
            <p><strong>Status:</strong> {event.statusi}</p>
            </div>
        </div>
    );
}

export default EventCard;