function SpeakerCard({speaker}){
    return (
        <div className="speaker-card">
            <img src={speaker.foto} alt={speaker.emri} className="speaker-image"/>

            <div className="speaker-content">
                <h2>{speaker.emri}</h2>
                <p>{speaker.bio}</p>
            </div>
        </div>
    );
}

export default SpeakerCard;