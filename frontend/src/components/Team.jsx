import "./Team.css";
const TEAM = [
  {
    name: "Serena Calloway",
    role: "Founder & CEO",
    bio: "Former gallerist turned digital curator. Serena spent 12 years in the contemporary art world before reimagining how people discover culture.",
    initials: "SC",
  },
  {
    name: "Marcus Osei",
    role: "Head of Curation",
    bio: "Trained musicologist and event architect. Marcus leads a team of 20 curators across five cities, selecting only the most resonant experiences.",
    initials: "MO",
  },
  {
    name: "Yuki Tanaka",
    role: "Creative Director",
    bio: "Multi-disciplinary designer whose work bridges editorial and digital. Yuki shapes every pixel of the Aura experience.",
    initials: "YT",
  },
];

function Team(){
    return(
        <div className="about-team-inner">
            <div className="about-team-header">
              <span className="eyebrow">The People</span>
              <h2 className="about-section-heading">Meet the <em>curators.</em></h2>
              <p className="about-team-sub">
                A small, opinionated team of culture obsessives who believe that
                taste is a muscle — and that we're here to help you exercise it.
              </p>
            </div>
            <div className="about-team-grid">
              {TEAM.map((member) => (
                <article className="about-team-card" key={member.name}>
                  <div className="about-team-avatar" aria-hidden="true">
                    <span className="about-team-initials">{member.initials}</span>
                  </div>
                  <div className="about-team-info">
                    <h3 className="about-team-name">{member.name}</h3>
                    <span className="about-team-role">{member.role}</span>
                    <p className="about-team-bio">{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
    );
}

export default Team;