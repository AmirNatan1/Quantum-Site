"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { legalDetails, publicContact } from "./data";
import { ClosingConversion } from "./components/home/ClosingConversion";
import { ConvergenceChamber } from "./components/home/ConvergenceChamber";
import { EvidenceStandard } from "./components/home/EvidenceStandard";
import { FocusTerritories } from "./components/home/FocusTerritories";
import { InspectionFieldHero } from "./components/home/InspectionFieldHero";
import { ProblemFramingChamber } from "./components/home/ProblemFramingChamber";
import { ProcessStory } from "./components/home/ProcessStory";
import { SparkActivation } from "./components/home/SparkActivation";
import { ProblemField } from "./components/needs/ProblemField";
import { SupportingRoutePage } from "./components/routes/SupportingRoutes";
import { SignalPath } from "./components/signal/SignalPath";
import { useRevealFoundation } from "./hooks/useRevealFoundation";
import { useQuantumSignalNarrative } from "./hooks/useQuantumSignalNarrative";
import { emitScrollFrame } from "./lib/scroll-frame";

type RouteProps = { route: string };
type SiteExperienceProps = RouteProps & { aboutTeam?: ReactNode };

const noScriptStyles = `
  .need-filters,.playground-controls[role="tablist"]{display:none!important}
  @media(max-width:959px){
    .site-header{position:static!important;height:auto!important;background:#fff!important;border-color:#e7ebec!important}
    .header-inner{min-height:68px;height:auto!important;flex-wrap:wrap}
    .menu-toggle{display:none!important}
    .site-nav{position:static!important;inset:auto!important;width:100%!important;padding:0 0 16px!important;background:#fff!important;display:flex!important;flex-flow:row wrap!important;align-items:center!important;gap:4px!important;opacity:1!important;visibility:visible!important;transform:none!important}
    .site-nav>a,.site-header.is-over-dark:not(.is-scrolled):not(.is-menu-open) .site-nav>a:not(.nav-spark){width:auto!important;min-height:44px!important;padding:8px 10px!important;border:1px solid #d3d8da!important;border-radius:4px!important;background:#fff!important;color:#2a2e30!important;font:700 .75rem/1.2 Manrope,Arial,sans-serif!important}
    .site-nav .nav-spark{margin:0!important}
  }
`;

const navItems = [
  ["For Industry", "/for-partners"],
  ["For Startups", "/for-startups"],
  ["How POCs Work", "/pocs"],
  ["Evidence", "/case-studies"],
  ["Focus Areas", "/industries"],
  ["About", "/about"],
] as const;

function NoScriptExperienceStyles() {
  return <noscript><style>{noScriptStyles}</style></noscript>;
}

function SiteHeader({ route }: RouteProps) {
  const [open, setOpen] = useState(false);
  const overlaysDarkSurface = route === "/" || route === "/for-partners";

  return (
    <header className={`site-header${overlaysDarkSurface ? " is-over-dark" : ""}${open ? " is-menu-open" : ""}`} data-site-header>
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
            <Link key={href} href={href} className={route === href ? "is-active" : ""} aria-current={route === href ? "page" : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link className={`nav-spark${route === "/spark" ? " is-active" : ""}`} href="/spark" aria-current={route === "/spark" ? "page" : undefined} onClick={() => setOpen(false)}>SPARK</Link>
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

function HomePage() {
  const narrativeRef = useRef<HTMLDivElement>(null);
  const { geometry } = useQuantumSignalNarrative(narrativeRef);

  return (
    <div className="home-narrative" ref={narrativeRef}>
      <SignalPath geometry={geometry} />
      <InspectionFieldHero />
      <ProblemFramingChamber />
      <ConvergenceChamber />
      <ProcessStory />
      <div
        className="problem-field-scene"
        data-scene-id="representative-challenges"
        data-scene-mode="full"
        data-scene-visual
        data-signal-anchor="representative-challenges"
        data-signal-order="11"
        data-signal-lane="start"
        data-problem-field
        data-problem-state="entry"
      >
        <i className="scene-signal-port" data-signal-port aria-hidden="true" />
        <ProblemField />
      </div>
      <FocusTerritories />
      <EvidenceStandard />
      <SparkActivation />
      <ClosingConversion />
    </div>
  );
}

function RoutePage({ route, aboutTeam }: SiteExperienceProps) {
  if (route === "/") return <HomePage />;
  return <SupportingRoutePage route={route} aboutTeam={aboutTeam} />;
}

export default function SiteExperience({ route, aboutTeam }: SiteExperienceProps) {
  useRevealFoundation(route);

  useEffect(() => {
    const root = document.documentElement;
    const previousRoute = root.dataset.quantumRoute;
    root.dataset.quantumRoute = route;
    if (!previousRoute || previousRoute === route) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  useEffect(() => {
    document.documentElement.classList.add("js-ready");
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
      emitScrollFrame();
    };
    const scheduleScrollUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    updateScroll();
    let fontNavigationFrame = 0;
    let cancelled = false;
    const alignHashTarget = (hash: string) => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      emitScrollFrame();
    };
    const navigationFrame = window.requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash) {
        alignHashTarget(hash);
        if ("fonts" in document) {
          void document.fonts.ready.then(() => {
            if (cancelled) return;
            fontNavigationFrame = window.requestAnimationFrame(() => alignHashTarget(hash));
          });
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(navigationFrame);
      window.cancelAnimationFrame(fontNavigationFrame);
    };
  }, [route]);

  return (
    <>
      <NoScriptExperienceStyles />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader route={route} />
      <main id="main-content" tabIndex={-1}><RoutePage route={route} aboutTeam={aboutTeam} /></main>
      <SiteFooter />
    </>
  );
}
