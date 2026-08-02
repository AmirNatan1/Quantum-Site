"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import {
  outcomes,
  partners,
  sectors,
  signalSteps,
  team,
  updates,
} from "./content";

type RouteProps = { route: string };

const navItems = [
  ["For partners", "/for-partners"],
  ["For startups", "/for-startups"],
  ["POCs", "/pocs"],
  ["Proof", "/case-studies"],
  ["About", "/about"],
];

function Arrow() {
  return <span className="arrow-line" aria-hidden="true" />;
}

function TitleText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(i)/g).map((part, index) =>
        part === "i" ? <span className="title-i" key={`${part}-${index}`}>{part}</span> : part,
      )}
    </>
  );
}

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <div className={`eyebrow${inverse ? " eyebrow-inverse" : ""}`}>
      <span className="eyebrow-dot" aria-hidden="true" />
      {children}
    </div>
  );
}

function Action({
  href,
  children,
  secondary = false,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      className={`action${secondary ? " action-secondary" : ""}${inverse ? " action-inverse" : ""}`}
      href={href}
    >
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  inverse = false,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  inverse?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading section-heading-${align}${inverse ? " inverse" : ""}`} data-reveal>
      <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>
      <h2><TitleText text={title} /></h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = Array.from({ length: 34 }, (_, index) => ({
      angle: (index / 34) * Math.PI * 2,
      radius: 0.16 + ((index * 17) % 22) / 100,
      speed: 0.0004 + ((index * 7) % 8) * 0.00008,
      phase: ((index * 13) % 31) / 31,
    }));

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointerX = (event.clientX - box.left) / box.width;
      pointerY = (event.clientY - box.top) / box.height;
    };

    const draw = () => {
      frame += reduceMotion ? 0 : 1;
      context.clearRect(0, 0, width, height);
      const cx = width * (0.5 + (pointerX - 0.5) * 0.035);
      const cy = height * (0.5 + (pointerY - 0.5) * 0.035);
      const scale = Math.min(width, height);

      context.strokeStyle = "rgba(42,46,48,.12)";
      context.lineWidth = 1;
      [0.21, 0.31, 0.405].forEach((radius) => {
        context.beginPath();
        context.arc(cx, cy, scale * radius, 0, Math.PI * 2);
        context.stroke();
      });

      const positions = points.map((point) => {
        const theta = point.angle + frame * point.speed;
        const pulse = Math.sin(frame * 0.012 + point.phase * Math.PI * 2) * 3;
        return {
          x: cx + Math.cos(theta) * (scale * point.radius + pulse),
          y: cy + Math.sin(theta) * (scale * point.radius + pulse),
        };
      });

      positions.forEach((point, index) => {
        const next = positions[(index + 7) % positions.length];
        const distance = Math.hypot(point.x - next.x, point.y - next.y);
        if (distance < scale * 0.43) {
          context.strokeStyle = `rgba(42,46,48,${Math.max(0.025, 0.12 - distance / scale / 4)})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      });

      positions.forEach((point, index) => {
        const active = index % 9 === 0;
        context.fillStyle = active ? "#D62C72" : "rgba(42,46,48,.48)";
        context.beginPath();
        context.arc(point.x, point.y, active ? 3.2 : 1.45, 0, Math.PI * 2);
        context.fill();
      });

      context.fillStyle = "#1A1E1F";
      context.beginPath();
      context.arc(cx, cy, 7, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#D62C72";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(cx, cy, 16, 0, Math.PI * 2);
      context.stroke();

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", move);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div className="signal-field" role="img" aria-label="A responsive field of connected signals converging on one test point">
      <canvas ref={canvasRef} />
      <div className="signal-label signal-label-one"><span /> operational need</div>
      <div className="signal-label signal-label-two"><span /> technology match</div>
      <div className="signal-label signal-label-three"><span /> field evidence</div>
      <div className="signal-core-label">Q / POC</div>
    </div>
  );
}

function SiteHeader({ route }: RouteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [route]);

  return (
    <header className="site-header" data-site-header>
      <div className="header-inner">
        <Link href="/" className="brand-link" aria-label="Quantum-hub home">
          <img src="/quantum-logo.svg" alt="Quantum-hub" width="174" height="44" />
        </Link>
        <button
          className={`menu-toggle${open ? " is-open" : ""}`}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span />
        </button>
        <nav className={`site-nav${open ? " is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className={route === href ? "is-active" : ""}>
              {label}
            </Link>
          ))}
          <Link className="nav-spark" href="/spark">SPARK</Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <div className="footer-brand">
          <img src="/quantum-logo-inverse.svg" alt="Quantum-hub" width="184" height="48" />
          <p>Operational needs. Proven technology.</p>
        </div>
        <div className="footer-nav">
          <div>
            <span>Work with us</span>
            <Link href="/for-partners">For partners</Link>
            <Link href="/for-startups">For startups</Link>
            <Link href="/spark">SPARK</Link>
          </div>
          <div>
            <span>Explore</span>
            <Link href="/industries">Industries</Link>
            <Link href="/pocs">POCs</Link>
            <Link href="/case-studies">Case studies</Link>
          </div>
          <div>
            <span>Connect</span>
            <Link href="/about">About</Link>
            <Link href="/updates">Updates</Link>
            <a href="https://www.linkedin.com/company/quantum-hub/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom shell">
        <span>Quantum © 2026 · T.L.G-T.S Technology LTD</span>
        <Link href="/contact">Get in touch</Link>
      </div>
    </footer>
  );
}

function PageHero({
  eyebrow,
  title,
  body,
  actions,
  orbitDot = true,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
  orbitDot?: boolean;
}) {
  return (
    <section className="page-hero">
      <div className="page-orbit" aria-hidden="true">{orbitDot ? <span /> : null}</div>
      <div className="shell page-hero-inner" data-reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1><TitleText text={title} /></h1>
        <p>{body}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

function MetricBand() {
  const metrics = [
    ["4", "corporate partners"],
    ["110", "POCs executed"],
    ["29", "group-wide implementations"],
    ["4", "operating sectors"],
  ];
  return (
    <section className="metric-band">
      <div className="shell">
        <Eyebrow>built around partner needs</Eyebrow>
        <div className="metric-grid">
          {metrics.map(([value, label], index) => (
            <div className="metric" key={label} data-reveal style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}>
              <strong data-count={value}>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerStrip() {
  return (
    <section className="partner-strip" aria-label="Corporate partners">
      <div className="shell partner-strip-inner">
        <span className="partner-strip-label">Shared by</span>
        {partners.map((partner) => (
          <a href={partner.href} target="_blank" rel="noreferrer" key={partner.short}>{partner.short}</a>
        ))}
      </div>
    </section>
  );
}

function StorySection() {
  const [active, setActive] = useState(0);
  return (
    <section className="story-section" data-story>
      <div className="shell story-layout">
        <div className="story-sticky">
          <SectionHeading
            eyebrow="the route from need to evidence"
            title="Follow the signal through Quantum-hub."
            body="Each step carries context forward, so the startup, the partner and the field team arrive at the test with one shared definition of success."
          />
          <div className="story-console" aria-live="polite">
            <div className="console-head"><span>Q / SIGNAL</span><span>0{active + 1} OF 05</span></div>
            <div className="console-orbit" aria-hidden="true">
              <i /><i /><i /><b />
            </div>
            <strong>{signalSteps[active].title}</strong>
            <p>{signalSteps[active].body}</p>
          </div>
        </div>
        <div className="story-steps">
          <div className="story-rail" aria-hidden="true"><span /></div>
          {signalSteps.map((step, index) => (
            <article
              className={`story-step${active === index ? " is-active" : ""}`}
              key={step.number}
              data-story-step
              onMouseEnter={() => setActive(index)}
            >
              <span>{step.number}</span>
              <div><h3><TitleText text={step.title} /></h3><p>{step.body}</p></div>
              <button type="button" onClick={() => setActive(index)} aria-label={`Show ${step.title}`}><span /></button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorSection({ full = false }: { full?: boolean }) {
  const [active, setActive] = useState(0);
  const selected = sectors[active];
  if (full) {
    return (
      <section className="sector-longform section-pad">
        <div className="shell">
          {sectors.map((sector, index) => (
            <article id={sector.key} className="sector-row" key={sector.key} data-reveal>
              <span>{sector.number}</span>
              <div><Eyebrow>operating sector</Eyebrow><h2><TitleText text={sector.title} /></h2></div>
              <div><p>{index === 0 ? "Mobility, sensing and safety technologies tested against partner use cases, including work run with Hyundai and with VDL." : index === 1 ? "Warehousing, sensing, routing and fleet operations across haulage, logistics centers and cargo terminals." : index === 2 ? "Automation, sensing and data for plants where unplanned downtime is the dominant cost." : "Efficiency, resilience, process technology and lower-impact energy systems, including hydrogen."}</p><p>{sector.detail}</p></div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="sector-section section-pad">
      <div className="shell">
        <SectionHeading eyebrow="industries we cover" title="One operating network across four sectors" />
        <div className="sector-interface" data-reveal>
          <div className="sector-tabs" role="tablist" aria-label="Industries">
            {sectors.map((sector, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={active === index}
                className={active === index ? "is-active" : ""}
                key={sector.key}
                onClick={() => setActive(index)}
              >
                <span>{sector.number}</span>{sector.title}
              </button>
            ))}
          </div>
          <div className="sector-display" role="tabpanel">
            <div className="sector-radar" aria-hidden="true"><span /><span /><span /><b /></div>
            <div className="sector-display-copy">
              <span>ACTIVE FIELD / {selected.number}</span>
              <h3><TitleText text={selected.title} /></h3>
              <p>{selected.summary}</p>
              <Link href={`/industries#${selected.key}`}>See the technology areas <Arrow /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomeGrid({ limit }: { limit?: number }) {
  const cards = typeof limit === "number" ? outcomes.slice(0, limit) : outcomes;
  return (
    <div className={`outcome-grid${limit ? " outcome-grid-featured" : ""}`}>
      {cards.map((outcome, index) => {
        const content = (
          <>
            <div className="outcome-top"><span>{outcome.sector}</span><span>0{index + 1}</span></div>
            <div className="outcome-signal"><i /><span>{outcome.signal}</span></div>
            <h3><TitleText text={outcome.company} /></h3>
            <p>{outcome.summary}</p>
            {outcome.href ? <div className="outcome-link">Read the field note <Arrow /></div> : null}
          </>
        );
        return outcome.href ? (
          <Link href={outcome.href} className="outcome-card" key={outcome.company} data-reveal>{content}</Link>
        ) : (
          <article className="outcome-card" key={outcome.company} data-reveal>{content}</article>
        );
      })}
    </div>
  );
}

function ProofSection() {
  return (
    <section className="proof-section section-pad">
      <div className="shell">
        <SectionHeading
          eyebrow="what came of it"
          title="POCs that ended in commitments."
          body="A test is only worth running if it can end in a decision. These ones did — with agreements signed by the partner, not by us."
        />
        <OutcomeGrid limit={4} />
        <div className="section-action"><Action href="/case-studies" secondary>See how these ran</Action></div>
      </div>
    </section>
  );
}

function PlaygroundPanel() {
  const [mode, setMode] = useState(0);
  const modes = [
    ["Camera", "6 positions", "Visibility"],
    ["Lidar", "3 conditions", "Signal return"],
    ["Vehicle", "Field route", "System fit"],
  ];
  return (
    <div className="playground-panel">
      <div className="playground-head"><span>KIA EV6 / TEST PLATFORM</span><b>LIVE READY</b></div>
      <div className="vehicle-stage" aria-hidden="true">
        <div className="vehicle-outline"><span /><span /><span /><span /></div>
        <div className="scan-line" />
      </div>
      <div className="playground-controls" role="tablist" aria-label="Example POC measurements">
        {modes.map((item, index) => (
          <button key={item[0]} type="button" className={mode === index ? "is-active" : ""} onClick={() => setMode(index)}>
            <span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function SparkBand() {
  return (
    <section className="spark-band">
      <div className="shell spark-layout">
        <div data-reveal>
          <Eyebrow inverse>spark — poc runway program</Eyebrow>
          <h2><TitleText text="Equity-free. Industry-backed. Built to commercialize." /></h2>
        </div>
        <div data-reveal>
          <p>SPARK connects MVP+ startups with the partner companies and runs a real POC around a use case a partner selects — with no equity taken and no participation fee.</p>
          <Action href="/spark" inverse>Read more about SPARK</Action>
        </div>
        <div className="spark-orbit" aria-hidden="true"><span /><i /><b /></div>
      </div>
    </section>
  );
}

function ClosingCTA({ title = "Have an operational challenge worth testing?", href = "/contact", label = "Book a meeting" }: { title?: string; href?: string; label?: string }) {
  return (
    <section className="closing-cta">
      <div className="shell closing-inner" data-reveal>
        <Eyebrow>start with the unknown</Eyebrow>
        <h2><TitleText text={title} /></h2>
        <Action href={href}>{label}</Action>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy" data-reveal>
            <Eyebrow>corporate innovation consortium</Eyebrow>
            <h1><span><TitleText text="Operational needs." /></span><span><TitleText text="Proven technology." /></span></h1>
            <p>The shared innovation arm of Bazan, Hyundai, VDL and Taavura-Livnat. We turn operational needs into technology searches, then prove the fit in the field.</p>
            <div className="hero-actions">
              <Action href="/for-partners">Bring a challenge</Action>
              <Action href="/spark-register" secondary>Apply to SPARK</Action>
            </div>
          </div>
          <div className="hero-visual" data-reveal><SignalField /></div>
        </div>
        <div className="hero-note shell"><span>Scroll to follow the signal</span><i /></div>
      </section>
      <PartnerStrip />
      <MetricBand />
      <section className="intro-section section-pad">
        <div className="shell editorial-split">
          <SectionHeading eyebrow="who we are" title="A matchmaker with a workshop" />
          <div data-reveal><p>Quantum-hub is the shared innovation arm of four industrial groups. Across automotive, logistics, Industry 4.0 and energy, we scout technology against needs our partners define, then prove the strongest matches in a workshop built for testing rather than presenting.</p><Action href="/about" secondary>Meet Quantum-hub</Action></div>
        </div>
      </section>
      <StorySection />
      <section className="statement-band"><div className="shell"><p>We prove the fit before partners commit to rollout.</p><span aria-hidden="true" /></div></section>
      <SectorSection />
      <ProofSection />
      <SparkBand />
      <section className="playground-section section-pad">
        <div className="shell playground-layout">
          <div>
            <SectionHeading eyebrow="from the playground" title="A workshop, not a showroom" body="We design, plan and execute POCs in-house. That includes a dedicated Kia EV6 built out as an integrated hardware and software platform, and access to live partner environments for tests that cannot be simulated." />
            <Action href="/pocs" secondary>See how we test</Action>
          </div>
          <PlaygroundPanel />
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}

function TeamGrid() {
  return (
    <div className="team-grid">
      {team.map((member, index) => (
        <a href={member.linkedin} target="_blank" rel="noreferrer" className="team-card" key={member.name} data-reveal style={{ "--reveal-delay": `${(index % 5) * 65}ms` } as React.CSSProperties}>
          <div className={`team-image${member.image ? "" : " team-image-placeholder"}`}>
            {member.image ? <img src={member.image} alt={`${member.name}, ${member.title}`} /> : <span>{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>}
            <i>in</i>
          </div>
          <h3><TitleText text={member.name} /></h3>
          <p>{member.title}</p>
        </a>
      ))}
    </div>
  );
}

const benefitCards = [
  ["Relevant access", "Use cases defined by partner operations, and the internal owners attached to them."],
  ["A real POC", "A scoped test at the playground or a partner site, with success criteria agreed before it starts."],
  ["Expert support", "A dedicated project team, plus cross-industry experts who have run trials in these environments."],
  ["Continued relevance", "Alumni stay in the network. Needs recur, and so do the introductions."],
];

function CardGrid({ cards, columns = 3 }: { cards: string[][]; columns?: number }) {
  return (
    <div className={`plain-grid plain-grid-${columns}`}>
      {cards.map(([title, body], index) => (
        <article className="plain-card" key={title} data-reveal>
          <span>0{index + 1}</span><h3><TitleText text={title} /></h3><p>{body}</p>
        </article>
      ))}
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="about quantum-hub" title="The people between industry and innovation" body="Quantum-hub has operated since 2020, moving from building relationships and capability to running POCs at scale across the partner groups." />
      <section className="section-pad"><div className="shell editorial-split"><SectionHeading eyebrow="why we exist" title="Two worlds, one translator" /><p data-reveal>The four partner companies know their operations. Startups know their technology. Neither speaks the other's language well enough to move quickly. We translate in both directions, scope a use case both sides recognize, and then settle it with a POC rather than a meeting.</p></div></section>
      <section className="team-section section-pad"><div className="shell"><SectionHeading eyebrow="our team" title="Who you'll work with" /><TeamGrid /></div></section>
      <ClosingCTA title="Come see the playground." />
    </>
  );
}

function PartnersPage() {
  const getCards = [
    ["Need-first scouting", "We do not start from a catalogue of technology. We map operational needs with your teams, then scout globally for companies at the right stage and readiness."],
    ["POCs executed in-house", "Our team owns POC design, planning and execution — at the playground or an agreed site of yours — with success criteria set before work begins."],
    ["De-risked adoption", "Criteria are agreed with you up front, so the result is a decision you can act on rather than a report you have to interpret."],
  ];
  const programs = [
    ["SPARK", "A cohort program running a real POC around a use case you select. Equity-free, no participation fee."],
    ["The Agile track", "Continuous scouting against needs that surface outside a program cycle, on your timeline."],
    ["CHAMP", "An internal innovation program for your executives, ending with a POC roadmap for a project inside their own organization."],
    ["Enrichment Academy", "A standing forum for senior managers across the partner groups, on trends and leadership challenges."],
  ];
  return (
    <>
      <PageHero eyebrow="for the partner companies" title="Innovation built around your operations" body="Quantum starts with a need inside one of the four partner companies, scouts the strongest-fit startup against it, and proves the solution in a POC the partner defines before anyone commits to rollout." actions={<><Action href="/contact">Start a POC</Action><Action href="/case-studies" secondary>See the proof</Action></>} />
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="what you get" title="Scouting that starts from your needs" /><CardGrid cards={getCards} /></div></section>
      <section className="section-pad subtle-section"><div className="shell"><SectionHeading eyebrow="how we engage" title="Four ways in" /><CardGrid cards={programs} columns={4} /></div></section>
      <section className="champ-section section-pad" id="champ"><div className="shell editorial-split"><SectionHeading eyebrow="champ" title="Build the internal owner before the test" /><div data-reveal><p>CHAMP is built for the people who have to make innovation survive contact with an operating business. Participants come from partner subsidiaries and spend the program building a POC roadmap for a project they will actually have to support internally. Sessions cover open innovation, mapping organizational needs, POC design, storytelling and AI tools, and close with a graduation event where each participant presents.</p>{/* TBC: confirm CHAMP cohort count is current */}</div></div></section>
      <section className="partner-detail-section section-pad"><div className="shell"><SectionHeading eyebrow="the consortium" title="Four partner companies. One playground." body="Automotive, logistics, Industry 4.0 and energy, inside four groups whose operations span haulage and warehousing, vehicle manufacturing and distribution, refining and petrochemicals, and data centers." /><div className="partner-accordion">{partners.map((partner) => <details key={partner.name}><summary><span>{partner.short}</span><b>{partner.name}</b><i /></summary><div><p>{partner.description}</p><a href={partner.href} target="_blank" rel="noreferrer">Visit company website <Arrow /></a></div></details>)}</div></div></section>
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="accountability" title="One POC. Three accountable teams." body="Every POC has three owners. Where any one of them is missing, we do not start." /><CardGrid cards={[["Own the operational need", "The partner defines the constraint, the site, and what a good result looks like."], ["Own the path to evidence", "We design the test, run it, and report what it actually showed."], ["Own product readiness", "The startup brings a working product and the engineering attention to support a real trial."]]} /></div></section>
      <ClosingCTA title="Tell us your pain point. We'll find the proof." label="Bring a challenge" />
    </>
  );
}

function StartupsPage() {
  return (
    <>
      <PageHero eyebrow="for startups" title="A route to real industrial use cases" body="Not a demo day. A scoped POC against a live operational need inside one of four industrial groups, with the people who would own the rollout in the room from the start." actions={<Action href="/spark-register">Apply to SPARK</Action>} />
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="what working with us gets you" title="What you actually get" /><CardGrid cards={benefitCards} columns={4} /></div></section>
      <section className="track-section section-pad"><div className="shell"><SectionHeading eyebrow="choose the fit" title="Two ways to work with us" /><div className="track-grid"><article data-reveal><span>01 / PROGRAM</span><h3><TitleText text="SPARK — the program" /></h3><p>A cohort program for MVP+ startups. Partners select the use case and the companies that proceed. Equity-free, no participation fee.</p><Action href="/spark" secondary>Explore SPARK</Action></article><article data-reveal><span>02 / ONGOING</span><h3><TitleText text="The Agile track — ongoing" /></h3><p>For needs that surface outside a cohort cycle. If your product matches one, we scout you directly.</p><Action href="/contact" secondary>Introduce your product</Action></article></div></div></section>
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="field evidence" title="See what came of it" /><OutcomeGrid limit={4} /><div className="section-action"><Action href="/case-studies" secondary>Explore all case studies</Action></div></div></section>
      <ClosingCTA title="Ready to test against the real environment?" href="/spark-register" label="Apply to SPARK" />
    </>
  );
}

function SparkPage() {
  const conditions = [
    ["Partners pick.", "The use case comes from a partner, not from us and not from a trend report."],
    ["Working product, real readiness.", "MVP+ means something you can install, instrument and support in the field."],
    ["Quantum executes.", "We design, plan and run the POC. You are not managing it alone."],
    ["Exposure with a deliverable", "You leave with evidence a partner can act on, not a stack of business cards."],
  ];
  const steps = [
    ["Show us the working product", "Apply with what exists today, not the roadmap version of it."],
    ["Pressure-test the fit", "We map your product against needs the partners have already defined."],
    ["Partners make the selection", "Partner teams review the shortlist and choose what proceeds."],
    ["Turn interest into a measurable test", "We scope the POC and agree success criteria with the partner before work starts."],
    ["Move from selection to execution", "The test runs at the playground or a partner site, with a dedicated project team."],
  ];
  const faqs = [
    ["Who can apply?", "MVP+ startups with a working product that can be installed and supported in a real operating environment. Stage matters less than field readiness."],
    ["What does it cost, and do you take equity?", "Nothing, and no. SPARK is equity-free and there is no participation fee."],
    ["Who chooses the use case?", "A partner company does. Use cases come from live operational needs inside the four groups, which is why a POC can lead to a real adoption decision."],
    ["Where does the POC run?", "At our workshop and POC center, or at an agreed partner site, depending on what the test requires."],
    ["What if the POC fails?", "A well-run test that produces a clear no is a result. You leave knowing why, with evidence, rather than spending another year guessing."],
    ["Do I need to be based in Israel?", "No. We scout globally. What matters is whether you can support a trial in the field."],
    ["What happens after the cohort?", "Alumni stay in the network. Partner needs recur, and companies we have worked with are the first place we look."],
  ];
  return (
    <>
      <PageHero eyebrow="spark — poc runway program" title="From application to industrial POC" body="SPARK connects MVP+ startups with four industrial groups and runs a real POC around a use case one of them selects. No equity is taken and there is no participation fee." actions={<Action href="/spark-register">Register</Action>} orbitDot={false} />
      {/* TBC: confirm SPARK cohort count */}
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="the operating conditions" title="Four conditions. One credible POC." body="SPARK works because four things are true at once. Remove any of them and a POC becomes a demonstration instead of a decision." /><CardGrid cards={conditions} columns={4} /></div></section>
      <section className="spark-steps section-pad"><div className="shell"><SectionHeading inverse eyebrow="program route" title="Five steps in" /><div className="vertical-steps">{steps.map(([title, body], index) => <article key={title} data-reveal><span>0{index + 1}</span><h3><TitleText text={title} /></h3><p>{body}</p></article>)}</div></div></section>
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="selected startup support" title="The team and sites around the test" /><CardGrid cards={[["A dedicated project team", "Assigned to your POC."], ["Beta-testing sites", "Access to live partner environments."], ["Cross-industry experts", "People who have run trials in these settings."], ["Alumni network", "Access continues after the cohort ends."]]} columns={4} /></div></section>
      <section className="faq-section section-pad"><div className="shell faq-layout"><SectionHeading eyebrow="frequently asked" title="Before you apply" /><div>{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<i /></summary><p>{answer}</p></details>)}</div></div></section>
      <ClosingCTA title="Think you're SPARK material?" href="/spark-register" label="Register" />
    </>
  );
}

function IndustriesPage() {
  return (
    <>
      <PageHero eyebrow="industries" title="Four sectors, one operating network" body="The four partner groups operate across automotive, logistics, Industry 4.0 and energy. We scout against needs defined inside each, which is why the technology areas below are narrow rather than exhaustive." />
      <SectorSection full />
      <ClosingCTA title="A real constraint is the best place to start." label="Bring a challenge" />
    </>
  );
}

function PocsPage() {
  const evidence = [
    ["Isolate the risk", "Name the single thing that has to be true for adoption to make sense."],
    ["Design around it", "Build the test to answer that question, not to produce a good video."],
    ["Instrument honestly", "Agree measurements and thresholds with the partner before anything runs."],
    ["Report either way", "A clear no, delivered early with evidence, is worth as much as a yes."],
  ];
  return (
    <>
      <PageHero eyebrow="proofs of concept" title="Make uncertainty smaller before rollout gets bigger." body="A proof of concept is a way of buying information. Run properly, it costs one scoped test. Run badly, it costs a rollout decision made on a guess." orbitDot={false} />
      <section id="evidence-engine" className="section-pad"><div className="shell"><SectionHeading eyebrow="the evidence engine" title="A disciplined trial answers one unknown at a time." /><CardGrid cards={evidence} columns={4} /></div></section>
      <section className="playground-section section-pad subtle-section"><div className="shell playground-layout"><div><SectionHeading eyebrow="the playground" title="A workshop, not a showroom" body="We design, plan and execute POCs in-house. That includes a dedicated testing vehicle — a Kia EV6 built out as an integrated hardware and software platform — and access to live partner environments for tests that cannot be simulated." />{/* TBC: beta-testing site count; workshop location */}<Action href="/case-studies" secondary>See the field evidence</Action></div><PlaygroundPanel /></div></section>
      <section className="actasys-teaser section-pad"><div className="shell editorial-split"><SectionHeading eyebrow="a poc in action" title="Actasys: sensor cleaning under test" /><div data-reveal><p>ActaJet tested across cameras and lidar, at multiple mounting positions, speeds, driving scenarios, weather and light conditions.</p><Action href="/case-studies/actasys" secondary>Open the field note</Action></div></div></section>
      <ClosingCTA />
    </>
  );
}

function CaseStudiesPage() {
  return (
    <>
      <PageHero eyebrow="case studies" title="What the tests actually showed" body="Each of these began as a constraint inside a partner company. Some ended in a signed agreement, some ended in a clear no. Both are results." />
      <section className="case-grid-section section-pad"><div className="shell"><OutcomeGrid /></div></section>
      <ClosingCTA title="Bring the next constraint into the field." label="Start a POC" />
    </>
  );
}

function ActasysPage() {
  return (
    <>
      <PageHero eyebrow="automotive · sensor cleaning" title="Actasys: keeping sensors clear" body="A field test structured around the conditions that decide whether a sensor-cleaning system can support ADAS and autonomous functions." />
      <section className="case-detail section-pad"><div className="shell"><article data-reveal><span>01</span><h2><TitleText text="The technology" /></h2><p>ActaJet is an electronically controlled system of small actuators that generate strong, localized jets of air at the sensor itself. Rather than washing a lens, it keeps the sensor's field of view clear continuously — which is what ADAS and autonomous functions depend on.</p></article><article data-reveal><span>02</span><h2><TitleText text="The test" /></h2><p>Actasys supplied several systems so cleaning performance could be measured rather than asserted. The POC covered ADAS cameras and lidar, lidar mounted both on the roof and in the grille, parking, urban and highway driving, and conditions including rain, mud and road splatter.</p></article><article data-reveal><span>03</span><h2><TitleText text="Why it was structured this way" /></h2><p>A sensor cleaning system only matters in the conditions that dirty a sensor. Testing it across mounting positions, speeds and weather was the only way to produce a result a partner could act on.</p></article></div></section>
      <section className="test-matrix-section"><div className="shell"><div className="test-matrix" data-reveal><div><span>TEST MATRIX / ACTAJET</span><b>FIELD CONFIGURATION</b></div>{[["Sensors", "Camera · Lidar"], ["Mounting", "Roof · Grille"], ["Routes", "Parking · Urban · Highway"], ["Conditions", "Rain · Mud · Road splatter"]].map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong><i /></div>)}</div></div></section>
      <ClosingCTA title="A POC should answer the adoption question." label="Design a test" />
    </>
  );
}

function UpdatesPage() {
  return (
    <>
      <PageHero eyebrow="company updates" title="Hub updates" body="Program notes, field activity and company milestones." />
      <section className="updates-section section-pad"><div className="shell updates-list">{/* TBC: publication dates for all updates */}{updates.map((update, index) => <article key={update} data-reveal><span>FIELD NOTE / 0{index + 1}</span><p>{update}</p><i /></article>)}</div></section>
      <ClosingCTA title="Follow the work between launches." href="https://www.linkedin.com/company/quantum-hub/" label="Follow on LinkedIn" />
    </>
  );
}

function FormStatus() {
  return <div className="form-status" role="status"><span>Preview mode</span><h3><TitleText text="The form is ready for connection." /></h3><p>Until the public inbox is confirmed, reach Quantum-hub through LinkedIn.</p><a href="https://www.linkedin.com/company/quantum-hub/" target="_blank" rel="noreferrer">Open LinkedIn <Arrow /></a></div>;
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return (
    <>
      <PageHero eyebrow="contact" title="Get in touch" body="If you have an operational challenge worth testing, or a product you think fits one, tell us in a few lines and we'll come back to you." />
      <section className="form-section section-pad"><div className="shell form-layout"><div data-reveal><Eyebrow>one clear signal</Eyebrow><h2><TitleText text="Start with the unknown." /></h2><p>A short description is enough. Tell us what needs to change, or what your product can already do in the field.</p>{/* TBC: public contact email address */}<a href="https://www.linkedin.com/company/quantum-hub/" target="_blank" rel="noreferrer">Quantum-hub on LinkedIn <Arrow /></a></div><div className="form-card" data-reveal>{sent ? <FormStatus /> : <form onSubmit={submit}><label>Work email<input type="email" name="email" autoComplete="email" required placeholder="you@company.com" /></label><label>Message<textarea name="message" required rows={7} placeholder="What are you trying to test?" /></label><button className="form-submit" type="submit">Send message <Arrow /></button></form>}</div></div></section>
    </>
  );
}

function SparkRegisterPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return (
    <>
      <PageHero eyebrow="spark application" title="Apply to SPARK" body="Applications are reviewed against needs the partner companies have already defined. Tell us what your product does today, and where it has run." />
      <section className="form-section application-section section-pad"><div className="shell form-layout"><div data-reveal><Eyebrow>field readiness</Eyebrow><h2><TitleText text="Show us what works today." /></h2><p>Equity-free. No participation fee.</p><div className="application-rail"><span>01 · Working product</span><span>02 · Real use case</span><span>03 · Field support</span></div></div><div className="form-card" data-reveal>{sent ? <FormStatus /> : <form onSubmit={submit} className="application-form"><label>Full name<input name="name" autoComplete="name" required /></label><label>Work email<input type="email" name="email" autoComplete="email" required /></label><label>Company<input name="company" autoComplete="organization" required /></label><label>Company website<input type="url" name="website" placeholder="https://" required /></label><label className="field-wide">What does the product do today?<textarea name="product" rows={5} required /></label><label className="field-wide">Where has it already run?<textarea name="field" rows={4} required /></label><label className="field-wide checkbox-field"><input type="checkbox" required /><span>I confirm this information is accurate and can be reviewed by Quantum-hub.</span></label><button className="form-submit field-wide" type="submit">Submit application <Arrow /></button></form>}</div></div></section>
    </>
  );
}

function RoutePage({ route }: RouteProps) {
  if (route === "/") return <HomePage />;
  if (route === "/about") return <AboutPage />;
  if (route === "/for-partners") return <PartnersPage />;
  if (route === "/for-startups") return <StartupsPage />;
  if (route === "/spark") return <SparkPage />;
  if (route === "/industries") return <IndustriesPage />;
  if (route === "/pocs") return <PocsPage />;
  if (route === "/case-studies") return <CaseStudiesPage />;
  if (route === "/case-studies/actasys") return <ActasysPage />;
  if (route === "/updates") return <UpdatesPage />;
  if (route === "/contact") return <ContactPage />;
  if (route === "/spark-register") return <SparkRegisterPage />;
  return <PageHero eyebrow="not found" title="This signal has moved." body="Return to the main site and follow the route from need to evidence." actions={<Action href="/">Back to Quantum-hub</Action>} />;
}

export default function SiteExperience({ route }: RouteProps) {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");
    const updateScroll = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
      if (progress) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
      }
      const story = document.querySelector<HTMLElement>("[data-story]");
      if (story) {
        const box = story.getBoundingClientRect();
        const span = Math.max(1, box.height - window.innerHeight);
        const value = Math.max(0, Math.min(1, -box.top / span));
        story.style.setProperty("--story-progress", `${value}`);
      }
    };
    const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((element) => revealObserver.observe(element));
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, [route]);

  return (
    <>
      <div className="scroll-progress" data-scroll-progress aria-hidden="true" />
      <SiteHeader route={route} />
      <main><RoutePage route={route} /></main>
      <SiteFooter />
    </>
  );
}
