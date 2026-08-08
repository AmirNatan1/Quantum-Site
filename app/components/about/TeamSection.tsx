import { teamMembers } from "../../data/team";

export function TeamSection() {
  return (
    <section className="team-section section-pad" aria-labelledby="about-team-heading">
      <div className="shell">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            the team
          </div>
          <h2 id="about-team-heading">Who you&apos;ll work with</h2>
        </div>
        <ul className="team-grid" data-team-roster>
          {teamMembers.map((member) => (
            <li key={member.name}>
              <a
                className="team-card"
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
              >
                <img
                  className="team-portrait"
                  src={member.image}
                  width="600"
                  height="600"
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                />
                <div className="team-card-copy">
                  <h3 className="team-card-name">{member.name}</h3>
                  <p className="team-card-title">{member.title}</p>
                  <span className="team-profile-label">
                    LinkedIn <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
