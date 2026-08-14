"use client";

import Link from "next/link";
import { KeyboardEvent, ReactNode, useState } from "react";
import {
  homeNarrativeCopy,
  legalDetails,
  partners,
  provingStages,
  publicContact,
  sectors,
  sparkRouteContent,
  sparkStatus,
  supportingRouteContent,
} from "../../data";
import { AccentHeadingText } from "../brand/AccentHeadingText";
import { ClosedSubmissionState } from "../forms/ClosedSubmissionState";
import { NeedsBoard } from "../needs/NeedsBoard";
import { SparkStatusPanel } from "../spark/SparkStatusPanel";

type RoutePageProps = { route: string; aboutTeam?: ReactNode };
type HeroVariant = "startups" | "partners" | "industries" | "pocs" | "about" | "spark" | "updates" | "legacy";

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

function TitleText({ text, reveal = false }: { text: string; reveal?: boolean }) {
  return <AccentHeadingText text={text} reveal={reveal} />;
}

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <div className={`eyebrow${inverse ? " eyebrow-inverse" : ""}`}>
      <span className="eyebrow-dot" aria-hidden="true" />
      {children}
    </div>
  );
}

function Action({ href, children, secondary = false, inverse = false }: { href: string; children: ReactNode; secondary?: boolean; inverse?: boolean }) {
  return (
    <Link className={`action${secondary ? " action-secondary" : ""}${inverse ? " action-inverse" : ""}`} href={href}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

function SectionHeading({ eyebrow, title, body, inverse = false }: { eyebrow: string; title: string; body?: string; inverse?: boolean }) {
  return (
    <div className={`section-heading${inverse ? " inverse" : ""}`} data-reveal="block">
      <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>
      <h2><TitleText text={title} reveal /></h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function RouteIndex({ label, items, inverse = false }: { label: string; items: readonly (readonly [string, string])[]; inverse?: boolean }) {
  return (
    <nav className={`route-index${inverse ? " route-index--inverse" : ""}`} aria-label={label}>
      <span>{label}</span>
      <ol>
        {items.map(([item, href], index) => (
          <li key={href}><a href={`#${href}`}><i>0{index + 1}</i>{item}</a></li>
        ))}
      </ol>
    </nav>
  );
}

function HeroVisual({ variant }: { variant: HeroVariant }) {
  if (variant === "legacy") return null;
  return (
    <div className={`route-hero__visual route-hero__visual--${variant}`} aria-hidden="true">
      <div className="route-hero__datum"><span>QH</span><b>{variant.toUpperCase()}</b></div>
    </div>
  );
}

function PageHero({
  eyebrow,
  title,
  body,
  actions,
  variant = "legacy",
  datum,
  index,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
  variant?: HeroVariant;
  datum?: string;
  index?: readonly (readonly [string, string])[];
}) {
  return (
    <section className={`page-hero page-hero--${variant}`} data-route-identity={variant === "legacy" ? undefined : variant}>
      <div className={`shell page-hero-inner${variant === "legacy" ? "" : " route-hero__grid"}`}>
        <div className="route-hero__copy" data-reveal="block">
          <div className="route-hero__registration"><Eyebrow>{eyebrow}</Eyebrow>{datum ? <span>{datum}</span> : null}</div>
          <h1><TitleText text={title} /></h1>
          <p>{body}</p>
          {actions ? <div className="hero-actions">{actions}</div> : null}
        </div>
        <HeroVisual variant={variant} />
        {index ? <RouteIndex label={`${eyebrow} page index`} items={index} inverse={variant === "partners"} /> : null}
      </div>
    </section>
  );
}

function ClosingCTA({ title = "Bring the question", href = "/contact", label = "Start a conversation", links }: { title?: string; href?: string; label?: string; links?: readonly (readonly [string, string])[] }) {
  const actions = links ?? [[label, href]];
  return (
    <section className="closing-cta">
      <div className="shell closing-inner" data-reveal="block">
        <Eyebrow>start with one need</Eyebrow>
        <h2><TitleText text={title} reveal /></h2>
        <div className="closing-actions">
          {actions.map(([actionLabel, actionHref]) => <Action href={actionHref} key={actionHref}>{actionLabel}</Action>)}
        </div>
      </div>
    </section>
  );
}

function ReadinessSurface() {
  return (
    <section id="readiness-surface" className="route-block readiness-surface" aria-labelledby="readiness-heading">
      <div className="shell readiness-layout">
        <div className="readiness-intro">
          <SectionHeading eyebrow="readiness surface" title="Make the product operationally legible" body="These are engagement considerations, not an open application checklist. A partner still has to want the answer to a specific use case." />
          <p className="route-note">The product stays the same. What changes is how clearly its deployment context, integration reality and proof question can be seen.</p>
        </div>
        <div className="readiness-cutaway">
          <div className="cutaway-object" aria-hidden="true" />
          <div className="cutaway-register">
            {sparkStatus.eligibility.map((item, index) => (
              <details key={item} open={index === 0 ? true : undefined}>
                <summary><span>0{index + 1}</span>{["Working product", "Available team", "Operational relevance", "Integration handover"][index]}</summary>
                <p>{item}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StartupsPage() {
  const content = supportingRouteContent.startups;
  return (
    <div className="support-route support-route--d5 support-route--startups" data-support-route="startups">
      <PageHero variant="startups" datum="D5 / 01" eyebrow="for startups" title="A real test, in a real environment, with a decision at the end" body="Quantum Hub is not an accelerator and does not invest as a condition of taking part. The offer is narrower: a partner with an operational need, a workshop that can build the test rig, and a written answer at the end." actions={<Action href="/spark">How SPARK works</Action>} index={content.index} />
      <ReadinessSurface />
      <section id="working-terms" className="route-block startup-terms" aria-labelledby="working-terms-heading">
        <div className="shell">
          <SectionHeading eyebrow="working terms" title="Two sides of one field test" body="Quantum Hub structures the environment and the answer. The startup brings a working product and the people needed to integrate it." />
          <div className="contribution-ledger">
            {(["hub", "startup"] as const).map((side) => (
              <section key={side} aria-labelledby={`${side}-contribution-heading`}>
                <header><span>{side === "hub" ? "QH / CONTRIBUTION" : "STARTUP / CONTRIBUTION"}</span><h3 id={`${side}-contribution-heading`}>{side === "hub" ? "Quantum Hub brings" : "The startup brings"}</h3></header>
                <dl>{content.contributions[side].map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
              </section>
            ))}
          </div>
        </div>
      </section>
      <section id="startup-path" className="route-block startup-path" aria-labelledby="startup-path-heading">
        <div className="shell startup-path__layout">
          <SectionHeading eyebrow="engagement path" title="From fit review to an explicit decision" />
          <ol>{content.path.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          <SparkStatusPanel />
        </div>
      </section>
      <ClosingCTA title="Tell us what you have built and where it works" href="/contact" label="Start a conversation" />
    </div>
  );
}

function PartnersPage() {
  const content = supportingRouteContent.partners;
  return (
    <div className="support-route support-route--d5 support-route--partners" data-support-route="partners">
      <PageHero variant="partners" datum="D5 / 02" eyebrow="for industry" title="Bring the problem. We will bring the evidence." body="Most operational problems that survive internal effort survive because nobody has framed them precisely enough to test. We turn the need into a testable question, scout globally against it, design the test with success criteria agreed in advance, and run it in the environment where it has to work." actions={<Action href="/contact" inverse>Frame a challenge with us</Action>} index={content.index} />
      <section id="operational-brief" className="route-block operational-brief" aria-labelledby="operational-brief-heading">
        <div className="shell briefing-layout">
          <div className="briefing-title"><SectionHeading eyebrow="briefing surface" title="From operational need to testable brief" body="The value is not an introduction. It is a controlled handoff from an unresolved operating condition to evidence a decision-maker can use." /></div>
          <ol className="briefing-sheet">
            {content.brief.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p><i aria-hidden="true" /></li>)}
          </ol>
        </div>
      </section>
      <section id="partner-contribution" className="route-block partner-contribution" aria-labelledby="partner-contribution-heading">
        <div className="shell partner-contribution__layout">
          <SectionHeading eyebrow="open the environment" title="What a partner provides" body="A test becomes possible when the operating context, internal owner and access path are explicit." />
          <dl>{content.contribution.map(([term, description], index) => <div key={term}><span>0{index + 1}</span><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
        </div>
      </section>
      <section id="partner-deliverable" className="route-block partner-deliverable" aria-labelledby="partner-deliverable-heading">
        <div className="shell partner-deliverable__sheet">
          <span>QH / TEST REPORT / OUTPUT</span>
          <h2 id="partner-deliverable-heading">A written report against criteria set at the start</h2>
          <p>Every test scenario carries a stated pass condition agreed before testing. The report covers objectives, setup, test plan, results per scenario, conclusions and recommendations, whichever way the results fall.</p>
          <div aria-label="Possible decisions"><b>Scale</b><b>Test again</b><b>Stop</b></div>
        </div>
      </section>
      <ClosingCTA title="Start with one need" href="/contact" label="Frame a challenge with us" />
    </div>
  );
}

function IndustriesPage() {
  return (
    <div className="support-route support-route--d5 support-route--industries" data-support-route="industries">
      <PageHero variant="industries" datum="D5 / 03" eyebrow="focus areas" title="Four areas, and the space between them" body="Our partners operate across automotive and mobility, logistics, energy, and Industry 4.0. The work often sits in the overlap between them." index={sectors.map((sector) => [sector.title, sector.key] as const)} />
      <section className="operating-territories" aria-label="Quantum Hub operating environments">
        {sectors.map((sector, index) => (
          <article id={sector.key} className={`operating-territory operating-territory--${index + 1}`} key={sector.key}>
            <div className="shell operating-territory__grid">
              <span>{sector.number}</span>
              <div><Eyebrow>operating environment</Eyebrow><h2>{sector.title}</h2></div>
              <p>{sector.summary}</p>
              <div className="territory-geometry" aria-hidden="true" />
            </div>
          </article>
        ))}
      </section>
      <section className="route-block territory-handoff"><div className="shell"><span>01—04 / CONNECTED</span><p>The work often sits in the overlap between these operating environments.</p></div></section>
      <ClosingCTA title="What this looks like in practice" href="/#representative-challenges" label="See representative challenges" />
    </div>
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
      <div className="vehicle-stage" aria-hidden="true"><div className="vehicle-outline"><span /><span /><span /><span /></div><div className="scan-line" /></div>
      <div className="playground-controls" role="tablist" aria-label="POC capability examples">
        {modes.map((item, index) => (
          <button key={item[0]} id={`playground-tab-${index}`} type="button" role="tab" aria-selected={mode === index} aria-controls="playground-readout" tabIndex={mode === index ? 0 : -1} className={mode === index ? "is-active" : ""} onClick={() => setMode(index)} onKeyDown={(event) => handleTabKey(event, index, modes.length, setMode, "playground-tab")}>
            <span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small>
          </button>
        ))}
      </div>
      <p id="playground-readout" className="sr-only" role="tabpanel" aria-labelledby={`playground-tab-${mode}`}>{modes[mode].join(", ")}</p>
      <noscript><div className="playground-controls playground-static-controls" aria-label="POC capability examples">{modes.map((item) => <article key={item[0]}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></article>)}</div></noscript>
    </div>
  );
}

function PocsPage() {
  return (
    <div className="support-route support-route--d5 support-route--pocs" data-support-route="pocs">
      <PageHero variant="pocs" datum="D5 / 04" eyebrow="method" title="How a POC actually runs" body="A proof of concept is worth running only if both sides will accept the answer before they know what it is. The method frames the unknown, fixes pass criteria in advance, isolates risk and reports whichever way the results fall." index={supportingRouteContent.pocs.index} />
      <section id="test-document" className="route-block route-steps poc-method-section test-document" aria-labelledby="test-document-heading">
        <div className="shell test-document__sheet">
          <header><span>QH / METHOD</span><h2 id="test-document-heading">The test document</h2><p>One proposition moves through five operations. Evidence, limitations and resistance stay attached to it until a decision is possible.</p></header>
          <aside aria-label="POC document fields"><dl><div><dt>Input</dt><dd>Operational unknown</dd></div><div><dt>Control</dt><dd>Criteria fixed first</dd></div><div><dt>Output</dt><dd>Decision-grade evidence</dd></div></dl></aside>
          <ol className="vertical-steps">
            {provingStages.map((stage) => <li key={stage.id}><span>0{stage.order}</span><h3>{stage.title}</h3><p>{stage.purpose}</p><small>{stage.consequence}</small><ul>{stage.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></li>)}
          </ol>
          <div className="poc-standard">
            <SectionHeading inverse eyebrow={homeNarrativeCopy.evidence.eyebrow} title={homeNarrativeCopy.evidence.title} body={homeNarrativeCopy.evidence.body} />
            <div className="poc-standard__principles">{homeNarrativeCopy.evidence.items.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
            <div className="method-resolution"><h3>Decision</h3><ul><li><strong>Scale</strong></li><li><strong>Iterate</strong><span>Reconfigure + retest</span></li><li><strong>Stop</strong><span>Useful no</span></li></ul><p>The purpose of a POC is a better decision, not a predetermined deployment.</p></div>
          </div>
        </div>
      </section>
      <NeedsBoard />
      <section id="test-capability" className="playground-section poc-playground route-block" aria-labelledby="test-capability-heading">
        <div className="shell playground-layout">
          <div><div className="section-heading"><Eyebrow>test capability</Eyebrow><h2 id="test-capability-heading"><TitleText text="A workshop, an instrumented vehicle, and working sites" reveal /></h2><p>The workshop supports integration and bench mockups. An instrumented Kia EV6 provides a vehicle platform. Partner environments support tests that cannot be simulated.</p></div><Action href="/case-studies" secondary>Evidence publication standard</Action></div>
          <PlaygroundPanel />
        </div>
      </section>
      <ClosingCTA title="Bring the question" />
    </div>
  );
}

function AboutPage({ team }: { team?: ReactNode }) {
  return (
    <div className="support-route support-route--d5 support-route--about" data-support-route="about">
      <PageHero variant="about" datum="D5 / 05" eyebrow="about" title="Owned by industry, built to test" body="Quantum Hub is wholly owned by the Taavura-Livnat Group and operates as a shared platform for a group of industrial partners. That structure is why technology can be tested in a working environment rather than a demonstration." index={supportingRouteContent.about.index} />
      <section id="operating-consortium" className="route-block operating-consortium" aria-labelledby="operating-consortium-heading">
        <div className="shell consortium-layout">
          <SectionHeading eyebrow="the operating consortium" title="Five organisations, one shared testing platform" body="Partner names and roles are shown without logos, scale figures or tier labels." />
          <ol className="consortium-register">
            {partners.map((partner, index) => <li key={partner.name}><span>0{index + 1}</span><div><h3>{partner.name}</h3><p>{partner.description}</p></div></li>)}
          </ol>
        </div>
      </section>
      <section id="selection-principle" className="route-block selection-principle" aria-labelledby="selection-principle-heading">
        <div className="shell selection-principle__grid"><span>GATE / 01</span><h2 id="selection-principle-heading">How we decide what to work on</h2><p>Technologies reach Quantum Hub through scouting, partner referral and programmes. They pass an initial review, technical diligence, and assessment by the partner business unit that would host the test. A technology with no internal owner on the partner side does not proceed.</p><b>Internal owner required</b></div>
      </section>
      {team}
      <section id="company-details" className="route-block company-register" aria-labelledby="company-details-heading"><div className="shell editorial-split"><span>COMPANY DETAILS / LEGAL REGISTER</span><h2 id="company-details-heading"><TitleText text={legalDetails.entityName} /></h2><p>Company number {legalDetails.companyNumber}<br />{legalDetails.registeredAddress}</p></div></section>
      <ClosingCTA title="Start with one question worth answering" />
    </div>
  );
}

function SparkPage() {
  return (
    <div className="support-route support-route--continuity support-route--spark" data-support-route="spark">
      <PageHero variant="spark" datum="PROGRAM / STATUS" eyebrow="spark" title="A POC runway with a partner who wants the answer" body="SPARK is a thirteen-week POC runway programme for MVP+ startups. It is equity-free and there is no participation fee." />
      <section className="section-pad"><div className="shell"><SparkStatusPanel /></div></section>
      <section className="route-steps section-pad"><div className="shell"><SectionHeading inverse eyebrow="programme route" title="From screening to a decision" /><ol className="vertical-steps">{sparkRouteContent.stages.map(([title, body], index) => <li key={title} data-reveal="block"><span>0{index + 1}</span><h3><TitleText text={title} /></h3><p>{body}</p></li>)}</ol></div></section>
      <section className="faq-section section-pad"><div className="shell faq-layout"><SectionHeading eyebrow="frequently asked" title="Before you take part" /><div>{sparkRouteContent.faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<i /></summary><p>{answer}</p></details>)}</div></div></section>
      <ClosingCTA title="Tell us what you have built and where it works" links={[["For Startups", "/for-startups"], ["How POCs Work", "/pocs"]]} />
    </div>
  );
}

function CaseStudiesPage() {
  return <div className="support-route support-route--deferred"><PageHero eyebrow="results" title="Evidence" body="A case follows the unknown, environment, test, criteria, evidence, decision and commercial outcome. A case is published only after both the startup and the partner approve it." /><section className="evidence-empty" aria-labelledby="evidence-empty-title"><div className="shell" data-reveal="block"><Eyebrow>results</Eyebrow><h2 id="evidence-empty-title"><TitleText text="Our case library is being prepared for publication" reveal /></h2><p>Each case is reviewed with the startup and the partner before we publish it. In the meantime, the method behind them is documented in full.</p><Action href="/pocs" secondary>See how a POC is designed</Action></div></section><ClosingCTA title="Bring the next question into the field" /></div>;
}

function UpdatesPage() {
  return <div className="support-route support-route--continuity support-route--updates" data-support-route="updates"><PageHero variant="updates" datum="PUBLICATION / CLOSED" eyebrow="publication status" title="Field notes are not published yet" body="This section stays hidden until there is a named publication owner and enough approved, dated posts to maintain it responsibly." /><ClosingCTA title="See the method behind the work" href="/pocs" label="How POCs work" /></div>;
}

function ContactPage() {
  return <div className="support-route support-route--deferred"><PageHero eyebrow="get in touch" title="Start with the need" body="Tell us what you are trying to find out. The more specific the question, the faster we can tell you whether Quantum Hub can help." /><section className="form-section section-pad"><div className="shell form-layout"><div data-reveal="block"><Eyebrow>contact details</Eyebrow><h2><TitleText text="A public form is not available" /></h2><p>{publicContact.address}</p><a href={publicContact.linkedin} target="_blank" rel="noreferrer">Quantum Hub on LinkedIn <Arrow /></a></div><div className="availability-card" data-reveal="block"><ClosedSubmissionState kind="contact" /></div></div></section></div>;
}

function SparkRegisterPage() {
  return <div className="support-route support-route--deferred"><PageHero eyebrow="spark application status" title="Applications are not open right now" body="No current cohort window, application URL or approved privacy wording is available for publication." /><section className="form-section application-section section-pad"><div className="shell form-layout"><div data-reveal="block"><Eyebrow>field readiness</Eyebrow><h2><TitleText text="No submission route is active" /></h2><p>When an application route is approved, the SPARK page will state the dates and requirements explicitly.</p></div><div className="availability-card" data-reveal="block"><ClosedSubmissionState kind="spark-register" /></div></div></section></div>;
}

export function SupportingRoutePage({ route, aboutTeam }: RoutePageProps) {
  if (route === "/about") return <AboutPage team={aboutTeam} />;
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
