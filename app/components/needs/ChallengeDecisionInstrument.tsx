"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useReducer, useRef } from "react";
import { homeNarrativeCopy, needs, sectors } from "../../data/index.ts";
import { track } from "../../lib/analytics";
import {
  challengeIdsForFilter,
  initialChallengeDecisionState,
  projectResolvedChallenge,
  reduceChallengeDecision,
  type ChallengeDecisionEvent,
  type ChallengeDecisionState,
  type ChallengeFilter,
  type ChallengeId,
} from "./challenge-decision-machine";

const stateMessages: Record<ChallengeDecisionState["status"], string> = {
  initial: "Choose a representative challenge to review.",
  selecting: "Choose one of the published representative challenges.",
  incomplete: "Choose a representative challenge before reviewing the decision frame.",
  ready: "Ready to review.",
  resolved: "Illustrative decision frame",
  unavailable: "No representative challenge is published for this focus area.",
  invalid: "This illustrative view is unavailable. The published challenge list remains available.",
};

const filterOptions = [
  { id: "all", label: "All" },
  ...sectors.map((sector) => ({ id: sector.id, label: sector.title })),
] as const;

const pocsLinkLabel = "See how a POC is designed";

function DecisionStandard({ headingLevel, showNotice = false }: { headingLevel: "h3" | "h4"; showNotice?: boolean }) {
  const Heading = headingLevel;
  return (
    <div className="challenge-decision-standard">
      <Heading>Decision standard</Heading>
      <dl>
        {homeNarrativeCopy.evidence.items.map(([title, body]) => (
          <div key={title}><dt>{title}</dt><dd>{body}</dd></div>
        ))}
      </dl>
      {showNotice ? <p className="challenge-result-notice">{homeNarrativeCopy.alignment.notice}</p> : null}
      <Link href="/pocs">{pocsLinkLabel}</Link>
    </div>
  );
}

function StaticFallback() {
  return (
    <noscript>
      <style>{`.challenge-instrument-enhanced { display: none !important; }`}</style>
      <div className="challenge-static-fallback" data-challenge-static-fallback>
        <div className="challenge-static-list">
          {needs.map((challenge) => (
            <article key={challenge.id}>
              <div><span>{challenge.sectorLabel}</span></div>
              <h3>{challenge.title}</h3>
              <p>{challenge.summary}</p>
            </article>
          ))}
        </div>
        <div className="challenge-static-standard"><DecisionStandard headingLevel="h3" showNotice /></div>
      </div>
    </noscript>
  );
}

export function ChallengeDecisionInstrument() {
  const [state, dispatch] = useReducer(
    (current: ChallengeDecisionState, event: ChallengeDecisionEvent) => reduceChallengeDecision(current, event),
    initialChallengeDecisionState,
  );
  const challengeGroupRef = useRef<HTMLFieldSetElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusTargetRef = useRef<"challenge" | "result" | null>(null);
  const startedRef = useRef(false);
  const pendingSelectionEventRef = useRef<ChallengeDecisionEvent | null>(null);
  const lastReviewKeyRef = useRef<string | null>(null);

  const activeFilter = state.status === "resolved" ? "all" : state.filter;
  const visibleIds = useMemo(() => challengeIdsForFilter(activeFilter), [activeFilter]);
  const visibleChallenges = needs.filter((challenge) => visibleIds.includes(challenge.id));
  const resolvedChallenge = projectResolvedChallenge(state);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const activate = () => {
      form.inert = false;
      form.removeAttribute("inert");
      form.removeAttribute("aria-hidden");
    };
    if (!("IntersectionObserver" in window)) {
      activate();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      activate();
      observer.disconnect();
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (focusTargetRef.current === "challenge" && state.status === "incomplete") {
      focusTargetRef.current = null;
      challengeGroupRef.current?.focus();
    }
    if (focusTargetRef.current === "result" && state.status === "resolved") {
      focusTargetRef.current = null;
      resultHeadingRef.current?.focus();
    }
  }, [state.status]);

  useEffect(() => {
    const selectionEvent = pendingSelectionEventRef.current;
    if (!selectionEvent) return;
    pendingSelectionEventRef.current = null;
    if (!startedRef.current) {
      startedRef.current = true;
      track({
        event: "instrument_start",
        route: "/",
        placement: "representative_challenges",
        instrument: "challenge_decision",
      });
    }
    if (selectionEvent.type === "FILTER_CHANGED") {
      track({
        event: "instrument_selection_change",
        route: "/",
        placement: "representative_challenges",
        instrument: "challenge_decision",
        selectionKind: "sector",
        sector: selectionEvent.filter,
      });
    }
    if (selectionEvent.type === "CHALLENGE_SELECTED") {
      track({
        event: "instrument_selection_change",
        route: "/",
        placement: "representative_challenges",
        instrument: "challenge_decision",
        selectionKind: "challenge",
      });
    }
  }, [state]);

  const applySelection = (event: ChallengeDecisionEvent) => {
    const next = reduceChallengeDecision(state, event);
    if (next === state) return;
    pendingSelectionEventRef.current = event;
    dispatch(event);
    lastReviewKeyRef.current = null;
  };

  const reviewOutcome = (next: ChallengeDecisionState) => {
    if (next.status === "resolved") return "illustrative_frame" as const;
    if (next.status === "unavailable") return "no_published_example" as const;
    if (next.status === "invalid") return "error" as const;
    return "incomplete" as const;
  };

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reviewEvent = { type: "REVIEW_REQUESTED" } as const;
    const next = reduceChallengeDecision(state, reviewEvent);
    const outcome = reviewOutcome(next);
    const reviewKey = outcome;
    dispatch(reviewEvent);

    if (next.status === "incomplete") focusTargetRef.current = "challenge";
    if (next.status === "resolved") focusTargetRef.current = "result";

    if (lastReviewKeyRef.current !== reviewKey) {
      lastReviewKeyRef.current = reviewKey;
      track({
        event: "instrument_result_view",
        route: "/",
        placement: "representative_challenges",
        instrument: "challenge_decision",
        instrumentOutcome: outcome,
      });
    }
  };

  const handleReset = () => {
    if (state.status === "initial") return;
    dispatch({ type: "RESET_REQUESTED" });
    lastReviewKeyRef.current = null;
    track({
      event: "instrument_reset",
      route: "/",
      placement: "representative_challenges",
      instrument: "challenge_decision",
    });
  };

  return (
    <section id="representative-challenges" className="needs-board challenge-instrument section-pad" aria-labelledby="needs-board-title">
      <div className="shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />the kind of problem we work on</div>
        <div className="needs-board-head">
          <h2 id="needs-board-title">Representative challenges</h2>
          <p>These are examples of the kind of operational need we frame and test against. They are not open calls.</p>
        </div>
        <p className="representative-notice">These categories describe the kind of work we do. They are not current opportunities, they carry no deadline, and applying against one does not create a live process. When we run an open call we will say so explicitly and date it.</p>

        <form ref={formRef} inert aria-hidden="true" className="challenge-instrument-enhanced" data-challenge-instrument data-instrument-state={state.status} onSubmit={handleReview}>
          <div className="challenge-instrument-controls">
            <fieldset className="challenge-filter-group">
              <legend>Focus area filter</legend>
              <div>
                {filterOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name="challenge-filter"
                      value={option.id}
                      checked={activeFilter === option.id}
                      onChange={() => applySelection({ type: "FILTER_CHANGED", filter: option.id as ChallengeFilter })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset
              ref={challengeGroupRef}
              className="challenge-choice-group"
              tabIndex={-1}
              aria-describedby="challenge-instrument-status"
              aria-invalid={state.status === "incomplete" ? "true" : undefined}
            >
              <legend>Representative challenge selection</legend>
              {visibleChallenges.length > 0 ? (
                <div className="challenge-choice-list">
                  {visibleChallenges.map((challenge) => (
                    <label className="need-card" key={challenge.id}>
                      <input
                        type="radio"
                        name="representative-challenge"
                        value={challenge.id}
                        checked={state.selectedChallengeId === challenge.id}
                        onChange={() => applySelection({ type: "CHALLENGE_SELECTED", challengeId: challenge.id as ChallengeId })}
                      />
                      <span><span className="sr-only">Representative challenge: </span><strong>{challenge.title}</strong></span>
                    </label>
                  ))}
                </div>
              ) : <p>{stateMessages.unavailable}</p>}
            </fieldset>

            <div className="challenge-instrument-actions">
              <button type="submit" disabled={state.status === "resolved"}>Review the decision frame</button>
              <button type="button" onClick={handleReset}>Reset</button>
            </div>
          </div>

          <div className="challenge-result-panel">
            <p
              id="challenge-instrument-status"
              className={`challenge-instrument-status status-${state.status}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {stateMessages[state.status]}
            </p>

            {resolvedChallenge ? (
              <div className="challenge-result" data-instrument-result="illustrative-frame">
                <h3 ref={resultHeadingRef} tabIndex={-1}>Illustrative decision frame</h3>
                <dl className="challenge-result-summary">
                  <div><dt>Representative challenge</dt><dd><strong>{resolvedChallenge.title}</strong><p>{resolvedChallenge.summary}</p></dd></div>
                  <div><dt>Published operating context</dt><dd>{resolvedChallenge.sectorLabel}</dd></div>
                </dl>
                <DecisionStandard headingLevel="h4" showNotice />
              </div>
            ) : (
              <div className="challenge-result-prompt"><DecisionStandard headingLevel="h3" /></div>
            )}
          </div>
        </form>

        <StaticFallback />
      </div>
    </section>
  );
}
