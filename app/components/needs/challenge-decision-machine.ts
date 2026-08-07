import { needs, sectors } from "../../data/index.ts";

export type ChallengeId = (typeof needs)[number]["id"];
export type SectorId = (typeof sectors)[number]["id"];
export type ChallengeFilter = "all" | SectorId;
export type InstrumentResultKind = "illustrative-frame";

type InitialState = {
  status: "initial";
  filter: "all";
  selectedChallengeId: null;
};

type EmptySelectionState = {
  status: "selecting" | "incomplete" | "unavailable" | "invalid";
  filter: ChallengeFilter;
  selectedChallengeId: null;
};

type ReadyState = {
  status: "ready";
  filter: ChallengeFilter;
  selectedChallengeId: ChallengeId;
};

type ResolvedState = {
  status: "resolved";
  selectedChallengeId: ChallengeId;
  resultKind: InstrumentResultKind;
};

export type ChallengeDecisionState =
  | InitialState
  | EmptySelectionState
  | ReadyState
  | ResolvedState;

export type ChallengeDecisionEvent =
  | { type: "FILTER_CHANGED"; filter: ChallengeFilter }
  | { type: "CHALLENGE_SELECTED"; challengeId: ChallengeId }
  | { type: "REVIEW_REQUESTED" }
  | { type: "RESET_REQUESTED" }
  | { type: "DATA_INVALIDATED" };

export type ChallengeDecisionData = readonly {
  id: ChallengeId;
  sectorIds: readonly string[];
}[];

export const initialChallengeDecisionState: ChallengeDecisionState = {
  status: "initial",
  filter: "all",
  selectedChallengeId: null,
};

export function challengeIdsForFilter(
  filter: ChallengeFilter,
  data: ChallengeDecisionData = needs,
) {
  return data
    .filter((challenge) => filter === "all" || challenge.sectorIds.includes(filter))
    .map((challenge) => challenge.id);
}

function isVisibleChallenge(
  challengeId: ChallengeId,
  filter: ChallengeFilter,
  data: ChallengeDecisionData,
) {
  return challengeIdsForFilter(filter, data).includes(challengeId);
}

function filterForState(state: ChallengeDecisionState): ChallengeFilter {
  return state.status === "resolved" ? "all" : state.filter;
}

export function reduceChallengeDecision(
  state: ChallengeDecisionState,
  event: ChallengeDecisionEvent,
  data: ChallengeDecisionData = needs,
): ChallengeDecisionState {
  if (event.type === "RESET_REQUESTED") {
    return state.status === "initial" ? state : initialChallengeDecisionState;
  }

  if (event.type === "DATA_INVALIDATED") {
    return state.status === "invalid"
      ? state
      : { status: "invalid", filter: filterForState(state), selectedChallengeId: null };
  }

  if (event.type === "FILTER_CHANGED") {
    if (state.status !== "resolved" && event.filter === state.filter) return state;
    const visibleIds = challengeIdsForFilter(event.filter, data);
    if (visibleIds.length === 0) {
      return { status: "unavailable", filter: event.filter, selectedChallengeId: null };
    }
    if (
      state.selectedChallengeId
      && visibleIds.includes(state.selectedChallengeId)
    ) {
      return {
        status: "ready",
        filter: event.filter,
        selectedChallengeId: state.selectedChallengeId,
      };
    }
    return { status: "selecting", filter: event.filter, selectedChallengeId: null };
  }

  if (event.type === "CHALLENGE_SELECTED") {
    const filter = filterForState(state);
    if (!isVisibleChallenge(event.challengeId, filter, data)) {
      return { status: "invalid", filter, selectedChallengeId: null };
    }
    if (state.selectedChallengeId === event.challengeId) return state;
    return {
      status: "ready",
      filter,
      selectedChallengeId: event.challengeId,
    };
  }

  if (state.status === "resolved") return state;
  if (state.status === "unavailable" || state.status === "invalid") return state;
  if (!state.selectedChallengeId) {
    return state.status === "incomplete"
      ? state
      : { status: "incomplete", filter: state.filter, selectedChallengeId: null };
  }
  if (!isVisibleChallenge(state.selectedChallengeId, state.filter, data)) {
    return { status: "invalid", filter: state.filter, selectedChallengeId: null };
  }
  return {
    status: "resolved",
    selectedChallengeId: state.selectedChallengeId,
    resultKind: "illustrative-frame",
  };
}

export function projectResolvedChallenge(state: ChallengeDecisionState) {
  if (state.status !== "resolved" || state.resultKind !== "illustrative-frame") return null;
  return needs.find((challenge) => challenge.id === state.selectedChallengeId) ?? null;
}
