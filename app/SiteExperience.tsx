"use client";

import Link from "next/link";
import { KeyboardEvent, ReactNode, useEffect, useState } from "react";
import {
  legalDetails,
  partners,
  publicContact,
  sectors,
  sparkStatus,
} from "./data";
import { AccentHeadingText } from "./components/brand/AccentHeadingText";
import { ConsortiumMark } from "./components/brand/ConsortiumMark";
import { AudienceSelector } from "./components/home/AudienceSelector";
import { ProcessStory } from "./components/home/ProcessStory";
import { ClosingConversion } from "./components/home/ClosingConversion";
import { NeedsBoard } from "./components/needs/NeedsBoard";
import { SparkStatusPanel } from "./components/spark/SparkStatusPanel";
import { LeadForm } from "./components/forms/LeadForm";

type RouteProps = { route: string };

const navItems = [
  ["For Industry", "/for-partners"],
  ["For Startups", "/for-startups"],
  ["How POCs Work", "/pocs"],
  ["Evidence", "/case-studies"],
  ["Focus Areas", "/industries"],
  ["About", "/about"],
] as const;

function handleTabKey(
  event: KeyboardEvent<HTMLButtonElement>,
  current: number,
  count: number,
  setCurrent: (index: number) => void,
  idPrefix: string,
) {
  let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % count;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + count) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  else return;

  event.preventDefault();
  setCurrent(next);
  document.getElementById(`${idPrefix}-${next}`)?.focus();
}

function Arrow() {
  return <span className="arrow-line" aria-hidden="true" />;
}

function TitleText({ text }: { text: string }) {
  return <AccentHeadingText text={text} />;
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

function SiteHeader({ route }: RouteProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" data-site-header>
      <div className="header-inner">
        <Link href="/" className="brand-link" aria-label="Quantum Hub home">
          <img src="/quantum-logo.svg" alt="Quantum Hub" width="174" height="44" />
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
            <Link key={href} href={href} className={route === href ? "is-active" : ""} onClick={() => setOpen(false)}>
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
          <Link href="/" className="footer-wordmark" aria-label="Quantum Hub home">Quantum Hub</Link>
          <p>Operational needs. Field-tested evidence.</p>
        </div>
        <div className="footer-nav">
          <div>
            <span>For startups</span>
            <Link href="/for-startups">For Startups</Link>
            <Link href="/spark">SPARK</Link>
            <Link href="/#representative-challenges">Representative Challenges</Link>
          </div>
          <div>
            <span>For industry</span>
            <Link href="/for-partners">For Industry</Link>
            <Link href="/pocs">How POCs Work</Link>
            <Link href="/case-studies">Evidence</Link>
          </div>
          <div>
            <span>Company</span>
            <Link href="/about">About</Link>
            <Link href="/industries">Focus Areas</Link>
            <Link href="/contact">Contact</Link>
            <a href={publicContact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom shell">
        <span>{legalDetails.entityName} · Company number {legalDetails.companyNumber}<br />{legalDetails.registeredAddress}</span>
        <span>© {new Date().getFullYear()} Quantum Hub. All rights reserved.</span>
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

function EvidenceBand() {
  const tiles = [
    ["Criteria first", "Pass conditions are defined per test scenario before testing begins."],
    ["Real environments", "Testing can take place in industrial facilities and operating environments appropriate to the question."],
    ["An answer either way", "Results that do not support a rollout are reported as clearly as results that do."],
  ];
  return (
    <section className="metric-band qualitative-band" aria-labelledby="evidence-band-title">
      <div className="shell">
        <Eyebrow inverse>what a POC produces</Eyebrow>
        <div className="qualitative-band-heading">
          <h2 id="evidence-band-title">A written answer, against criteria agreed in advance</h2>
          <p>Before anything is built, both sides write down what success looks like. The final report states objectives, setup, test plan, results per scenario, conclusions and recommendations.</p>
        </div>
        <div className="metric-grid qualitative-grid">
          {tiles.map(([title, body], index) => <article key={title} data-reveal style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function PartnerStrip() {
  return (
    <section className="partner-strip" aria-label="Industrial partners">
      <div className="shell partner-strip-inner">
        <span className="partner-strip-label">Who is behind this</span>
        {partners.map((partner) => <ConsortiumMark partner={partner} key={partner.id} />)}
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
          {sectors.map((sector) => (
            <article id={sector.key} className="sector-row" key={sector.key} data-reveal>
              <span>{sector.number}</span>
              <div><Eyebrow>focus area</Eyebrow><h2><TitleText text={sector.title} /></h2></div>
              <div><p>{sector.summary}</p></div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="sector-section section-pad">
      <div className="shell">
        <SectionHeading eyebrow="focus areas" title="Four areas, and the space between them" />
        <div className="sector-interface" data-reveal>
          <div className="sector-tabs" role="tablist" aria-label="Industries">
            {sectors.map((sector, index) => (
              <button
                id={`sector-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls="sector-tabpanel"
                tabIndex={active === index ? 0 : -1}
                className={active === index ? "is-active" : ""}
                key={sector.key}
                onClick={() => setActive(index)}
                onKeyDown={(event) => handleTabKey(event, index, sectors.length, setActive, "sector-tab")}
              >
                <span>{sector.number}</span>{sector.title}
              </button>
            ))}
          </div>
          <div id="sector-tabpanel" className="sector-display" role="tabpanel" aria-labelledby={`sector-tab-${active}`}>
            <div className="sector-radar" aria-hidden="true"><span /><span /><span /><b /></div>
            <div className="sector-display-copy">
              <span>FOCUS AREA / {selected.number}</span>
              <h3><TitleText text={selected.title} /></h3>
              <p>{selected.summary}</p>
              <Link href={`/industries#${selected.key}`}>Explore this focus area <Arrow /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceEmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`evidence-empty${compact ? " evidence-empty-compact" : ""}`} aria-labelledby={compact ? "home-evidence-title" : "evidence-empty-title"}>
      <div className="shell" data-reveal>
        <Eyebrow>results</Eyebrow>
        <h2 id={compact ? "home-evidence-title" : "evidence-empty-title"}>Our case library is being prepared for publication</h2>
        <p>Each case is reviewed with the startup and the partner before we publish it. In the meantime, the method behind them is documented in full.</p>
        <Action href="/pocs" secondary>See how a POC is designed</Action>
      </div>
    </section>
  );
}

function PlaygroundPanel() {
  const [mode, setMode] = useState(0);
  const modes = [
    ["Integration", "Isolated", "Risk control"],
    ["Vehicle", "Instrumented", "Data capture"],
    ["Test matrix", "Criteria set", "Evidence"],
  ];
  return (
    <div className="playground-panel">
      <div className="playground-head"><span>KIA EV6 / TEST PLATFORM</span><b>INSTRUMENTED</b></div>
      <div className="vehicle-stage" aria-hidden="true">
        <div className="vehicle-outline"><span /><span /><span /><span /></div>
        <div className="scan-line" />
      </div>
      <div className="playground-controls" role="tablist" aria-label="POC capability examples">
        {modes.map((item, index) => (
          <button key={item[0]} id={`playground-tab-${index}`} type="button" role="tab" aria-selected={mode === index} aria-controls="playground-readout" tabIndex={mode === index ? 0 : -1} className={mode === index ? "is-active" : ""} onClick={() => setMode(index)} onKeyDown={(event) => handleTabKey(event, index, modes.length, setMode, "playground-tab")}>
            <span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small>
          </button>
        ))}
      </div>
      <p id="playground-readout" className="sr-only" role="tabpanel" aria-labelledby={`playground-tab-${mode}`}>{modes[mode].join(", ")}</p>
    </div>
  );
}

function SparkBand() {
  return (
    <section className="spark-band">
      <div className="shell spark-layout">
        <div data-reveal>
          <Eyebrow inverse>for startups</Eyebrow>
          <h2><TitleText text="SPARK: a POC runway with a partner who wants the answer" /></h2>
        </div>
        <div data-reveal>
          <p>SPARK is a thirteen-week programme for MVP+ startups. It is equity-free and there is no participation fee. Application dates are not currently published.</p>
          <Action href="/spark" inverse>How SPARK works</Action>
        </div>
        <div className="spark-orbit" aria-hidden="true"><span /><i /><b /></div>
      </div>
    </section>
  );
}

function ClosingCTA({ title = "Bring the question", href = "/contact", label = "Start a conversation" }: { title?: string; href?: string; label?: string }) {
  return (
    <section className="closing-cta">
      <div className="shell closing-inner" data-reveal>
        <Eyebrow>start with one need</Eyebrow>
        <h2><TitleText text={title} /></h2>
        <Action href={href}>{label}</Action>
      </div>
    </section>
  );
}

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

function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-safe-visual" aria-hidden="true"><span /><span /><span /><i /></div>
        <div className="shell hero-grid">
          <div className="hero-copy" data-reveal>
            <Eyebrow>An industrial consortium</Eyebrow>
            <h1 aria-label="Prove it where it has to work"><span><TitleText text="Prove it where" /></span><span><TitleText text="it has to work" /></span></h1>
            <p>Quantum Hub connects operational needs inside major industrial groups with technology that is ready to be tested. We frame the need, find the technology, design the test, run it in the environment where it has to perform, and hand both sides evidence they can decide on.</p>
            <div className="hero-actions">
              <Action href="/contact?intent=challenge">Bring an operational need</Action>
              <Action href="/for-startups" secondary inverse>I have technology to test</Action>
            </div>
          </div>
        </div>
        <div className="hero-note shell"><span>Scroll to see the method</span><i /></div>
      </section>
      <PartnerStrip />
      <EvidenceBand />
      <AudienceSelector />
      <section className="intro-section section-pad">
        <div className="shell editorial-split">
          <SectionHeading eyebrow="the model" title="We match technology to need — and we build the test ourselves" />
          <div data-reveal><p>We scout and match, and then do the engineering: fabricating mounts, routing wiring, integrating sensors, standing up an isolated test network and instrumenting a vehicle. The match is useful only if someone can build the test.</p><Action href="/about" secondary>About Quantum Hub</Action></div>
        </div>
      </section>
      <ProcessStory />
      <NeedsBoard />
      <SectorSection />
      <EvidenceEmptyState compact />
      <SparkBand />
      <section className="playground-section section-pad">
        <div className="shell playground-layout">
          <div>
            <SectionHeading eyebrow="test capability" title="A workshop, an instrumented vehicle, and access to working sites" body="Our workshop builds mounts, wiring, power, integration and isolated test networks. The instrumented Kia EV6 provides a vehicle platform, and partner environments support tests that cannot be simulated." />
            <Action href="/pocs" secondary>What we can test</Action>
          </div>
          <PlaygroundPanel />
        </div>
      </section>
      <ClosingConversion />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="about" title="Owned by industry, built to test" body="Quantum Hub is wholly owned by the Taavura-Livnat Group and operates as a shared platform for a group of industrial partners. That structure is why technology can be tested in a working environment rather than a demonstration." />
      <section className="partner-detail-section section-pad"><div className="shell"><SectionHeading eyebrow="the consortium" title="The partners" body="Partner names and roles are shown without logos, scale figures or tier labels." /><div className="partner-accordion">{partners.map((partner) => <details key={partner.name}><summary><span>{partner.short}</span><b>{partner.name}</b><i /></summary><div><p>{partner.description}</p></div></details>)}</div></div></section>
      <section className="section-pad subtle-section"><div className="shell editorial-split"><SectionHeading eyebrow="selection" title="How we decide what to work on" /><p data-reveal>Technologies reach Quantum Hub through scouting, partner referral and programmes. They pass an initial review, technical diligence, and assessment by the partner business unit that would host the test. A technology with no internal owner on the partner side does not proceed.</p></div></section>
      <section className="section-pad"><div className="shell editorial-split"><SectionHeading eyebrow="company details" title={legalDetails.entityName} /><p data-reveal>Company number {legalDetails.companyNumber}<br />{legalDetails.registeredAddress}</p></div></section>
      <ClosingCTA title="Start with one question worth answering" />
    </>
  );
}

function PartnersPage() {
  const cards = [
    ["Frame the need", "We work with your business units to identify and prioritise the operational question before looking at technology."],
    ["Scout against it", "Once the need is framed, we search globally, assess candidates technically and put a short list in front of the people who will host the test."],
    ["Build the test", "Scope, test scenarios, KPIs and pass conditions are agreed before integration and execution begin."],
  ];
  return (
    <>
      <PageHero eyebrow="for industry" title="Bring the problem. We will bring the evidence." body="Most operational problems that survive internal effort survive because nobody has framed them precisely enough to test. We turn the need into a testable question, scout globally against it, design the test with success criteria agreed in advance, and run it in the environment where it has to work." actions={<Action href="/contact?intent=challenge">Frame a challenge with us</Action>} />
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="method" title="Framing first, scouting second" /><CardGrid cards={cards} /></div></section>
      <section className="section-pad subtle-section"><div className="shell"><SectionHeading eyebrow="your side" title="What a partner provides" /><CardGrid cards={[["A named internal owner", "Someone inside the organisation with the authority and time to pursue the answer."], ["Access to the environment", "The site, line, vehicle or facility where the technology has to perform."], ["A route through safety and access", "Site induction, permits, systems and data access scoped to the test."]]} /></div></section>
      <section className="section-pad"><div className="shell editorial-split"><SectionHeading eyebrow="the deliverable" title="A written report against criteria set at the start" /><p data-reveal>Every test scenario carries a stated pass condition agreed before testing. The report covers objectives, setup, test plan, results per scenario, conclusions and recommendations, whichever way the results fall.</p></div></section>
      <ClosingCTA title="Start with one need" href="/contact?intent=challenge" label="Frame a challenge with us" />
    </>
  );
}

function StartupsPage() {
  return (
    <>
      <PageHero eyebrow="for startups" title="A real test, in a real environment, with a decision at the end" body="Quantum Hub is not an accelerator and does not invest as a condition of taking part. The offer is narrower: a partner with an operational need, a workshop that can build the test rig, and a written answer at the end." actions={<Action href="/spark">How SPARK works</Action>} />
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="readiness" title="You are ready if" /><CardGrid cards={sparkStatus.eligibility.map((item, index) => [`0${index + 1}`, item])} columns={4} /></div></section>
      <section className="section-pad subtle-section"><div className="shell editorial-split"><SectionHeading eyebrow="selection" title="The bar is a partner who wants the answer" /><p data-reveal>{sparkStatus.selectionCriteria}</p></div></section>
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="commercials" title="Equity-free, no participation fee" body="Each party keeps its own intellectual property. We are confirming how POC costs are allocated between Quantum Hub, the partner and the startup. Ask us and we will tell you what applies to your case." /><CardGrid cards={[["Programme", sparkStatus.duration], ["Participation", sparkStatus.participationFee], ["Equity", sparkStatus.equity]]} /></div></section>
      <section className="section-pad"><div className="shell"><SparkStatusPanel /></div></section>
      <ClosingCTA title="Tell us what you have built and where it works" href="/contact?intent=startup" label="Start a conversation" />
    </>
  );
}

function SparkPage() {
  const stages = [
    ["Screening", "Fit is assessed against operational needs raised by partners."],
    ["Partner meetings", "Quantum Hub and partner business units examine the fit."],
    ["POC scoping", "The startup and partner define the question, test and criteria."],
    ["Programme work", "Progress reviews and practical workshops support execution."],
    ["Decision", "The evidence supports taking it further, testing again with a changed scope, or stopping."],
  ];
  const faqs = [
    ["Does Quantum Hub take equity?", "No. The programme is equity-free and there is no participation fee."],
    ["Who owns the IP?", "Each party retains all right, title and interest in its own intellectual property."],
    ["What stage do I need to be at?", "MVP or beta, generally TRL 5 and above, with a full-time team able to support the test."],
    ["How long does it take?", "The programme runs thirteen weeks. POC execution can run longer than the programme itself."],
    ["When do applications open?", "No current cohort window or application route is approved for publication."],
  ];
  return (
    <>
      <PageHero eyebrow="spark" title="A POC runway with a partner who wants the answer" body="SPARK is a thirteen-week POC runway programme for MVP+ startups. It is equity-free and there is no participation fee." orbitDot={false} />
      <section className="section-pad"><div className="shell"><SparkStatusPanel /></div></section>
      <section className="spark-steps section-pad"><div className="shell"><SectionHeading inverse eyebrow="programme route" title="From screening to a decision" /><div className="vertical-steps">{stages.map(([title, body], index) => <article key={title} data-reveal><span>0{index + 1}</span><h3><TitleText text={title} /></h3><p>{body}</p></article>)}</div></div></section>
      <section className="faq-section section-pad"><div className="shell faq-layout"><SectionHeading eyebrow="frequently asked" title="Before you take part" /><div>{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<i /></summary><p>{answer}</p></details>)}</div></div></section>
      <ClosingCTA title="Tell us what you have built and where it works" href="/contact?intent=startup" label="Start a conversation" />
    </>
  );
}

function IndustriesPage() {
  return (
    <>
      <PageHero eyebrow="focus areas" title="Four areas, and the space between them" body="Our partners operate across automotive and mobility, logistics, energy, and Industry 4.0. The work often sits in the overlap between them." />
      <SectorSection full />
      <ClosingCTA title="What this looks like in practice" href="/#representative-challenges" label="See representative challenges" />
    </>
  );
}

function PocsPage() {
  const method = [
    ["Start with the question", "Every POC has one narrow, answerable question at its centre."],
    ["Scope deliberately", "The plan defines scenarios, KPIs, pass criteria and what is out of scope."],
    ["Isolate the risk", "Live-system interactions are tested on an isolated network or instrumented mockup first."],
    ["Report either way", "Results are stated against the criteria fixed before testing, including failed or incomplete scenarios."],
  ];
  return (
    <>
      <PageHero eyebrow="method" title="How a POC actually runs" body="A proof of concept is worth running only if both sides will accept the answer before they know what it is. The method frames the unknown, fixes pass criteria in advance, isolates risk and reports whichever way the results fall." orbitDot={false} />
      <section className="section-pad"><div className="shell"><SectionHeading eyebrow="the method" title="One unknown at a time" /><CardGrid cards={method} columns={4} /></div></section>
      <NeedsBoard />
      <section className="playground-section section-pad subtle-section"><div className="shell playground-layout"><div><SectionHeading eyebrow="test capability" title="A workshop, an instrumented vehicle, and working sites" body="The workshop supports integration and bench mockups. An instrumented Kia EV6 provides a vehicle platform. Partner environments support tests that cannot be simulated." /><Action href="/case-studies" secondary>Evidence publication standard</Action></div><PlaygroundPanel /></div></section>
      <section className="section-pad"><div className="shell editorial-split"><SectionHeading eyebrow="reporting" title="One report format, whatever the result" /><p data-reveal>Executive summary, objectives, setup, test plan, results per scenario, conclusions and recommendations. Results are stated against the criteria fixed before testing.</p></div></section>
      <ClosingCTA title="Bring the question" />
    </>
  );
}

function CaseStudiesPage() {
  return (
    <>
      <PageHero eyebrow="results" title="Evidence" body="A case follows the unknown, environment, test, criteria, evidence, decision and commercial outcome. A case is published only after both the startup and the partner approve it." />
      <EvidenceEmptyState />
      <ClosingCTA title="Bring the next question into the field" />
    </>
  );
}

function UpdatesPage() {
  return (
    <>
      <PageHero eyebrow="publication status" title="Field notes are not published yet" body="This section stays hidden until there is a named publication owner and enough approved, dated posts to maintain it responsibly." />
      <ClosingCTA title="See the method behind the work" href="/pocs" label="How POCs work" />
    </>
  );
}

function ContactPage() {
  return (
    <>
      <PageHero eyebrow="get in touch" title="Start with the need" body="Tell us what you are trying to find out. The more specific the question, the faster we can tell you whether Quantum Hub can help." />
      <section className="form-section section-pad"><div className="shell form-layout"><div data-reveal><Eyebrow>contact details</Eyebrow><h2><TitleText text="A public form is not available" /></h2><p>{publicContact.address}</p><a href={publicContact.linkedin} target="_blank" rel="noreferrer">Quantum Hub on LinkedIn <Arrow /></a></div><div className="form-card" data-reveal><LeadForm kind="contact" /></div></div></section>
    </>
  );
}

function SparkRegisterPage() {
  return (
    <>
      <PageHero eyebrow="spark application status" title="Applications are not open right now" body="No current cohort window, application URL or approved privacy wording is available for publication." />
      <section className="form-section application-section section-pad"><div className="shell form-layout"><div data-reveal><Eyebrow>field readiness</Eyebrow><h2><TitleText text="No submission route is active" /></h2><p>When an application route is approved, the SPARK page will state the dates and requirements explicitly.</p></div><div className="form-card" data-reveal><LeadForm kind="spark-register" /></div></div></section>
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
  if (route === "/updates") return <UpdatesPage />;
  if (route === "/contact") return <ContactPage />;
  if (route === "/spark-register") return <SparkRegisterPage />;
  return null;
}

export default function SiteExperience({ route }: RouteProps) {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
      if (progress) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
      }
    };
    const scheduleScrollUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
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
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    updateScroll();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, [route]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="scroll-progress" data-scroll-progress aria-hidden="true" />
      <SiteHeader route={route} />
      <main id="main-content" tabIndex={-1}><RoutePage route={route} /></main>
      <SiteFooter />
    </>
  );
}
