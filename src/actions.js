import Immutable from 'immutable';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import {getChallenge} from './util/jservice';

/* Action types */

export const HISTORY_STATE_POP = 'HISTORY_STATE_POP';
export const HISTORY_STATE_PUSH = 'HISTORY_STATE_PUSH';
export const HYDRATE = 'HYDRATE';
export const TILE_ADD = 'TILE_ADD';
export const TILE_REMOVE = 'TILE_REMOVE';
export const TILE_SELECT = 'TILE_SELECT';

/* Action utils */

// Arbitrary constant unlikely to ever appear naturally
const RUN_DELIMITER = '@#"';

// Converts the server's challenge format into a complete Redux state
const loadNewChallenge = (challengeJson) => {
  // Post-process challenge
  const solutionChars = challengeJson.tileString.split('');
  const solutionRuns = challengeJson.solution.trim().replace(
    /(\w+)/g,
    `${RUN_DELIMITER}$1${RUN_DELIMITER}`
  ).split(RUN_DELIMITER).filter((run) => run.length).map((run) => (
    run.charAt(0).match(/\w/) ? run.length : run
  ));

  // Mark challenge as seen
  const seenChallenges = JSON.parse(localStorage.seenChallenges || '[]');
  if (!seenChallenges.includes(challengeJson.id)) {
    seenChallenges.push(challengeJson.id);
    localStorage.seenChallenges = JSON.stringify(seenChallenges);
  }

  return Immutable.fromJS({
    filteredSolution: challengeJson.solution.replace(/[^\w]/g, ''),
    guess: '',
    guessTileIds: [],
    id: challengeJson.id,
    prompt: challengeJson.prompt,
    selectedTileId: 0,
    solutionRuns,
    solved: false,
    tiles: solutionChars.map((char, id) => ({char, id, used: false})),
    tileString: challengeJson.tileString
  });
};

export const initializeChallengeState = () => {
  const challengeState = window.localStorage.challengeState;
  if (typeof challengeState === 'string') {
    return Immutable.fromJS(JSON.parse(challengeState));
  }
  return loadNewChallenge(window.initialData);
};

/* Action creators */

export const popHistoryState = () => ({type: HISTORY_STATE_POP});

export const pushHistoryState = () => ({type: HISTORY_STATE_PUSH});

export const hydrate = (hydrateState) => ({
  state: hydrateState,
  type: HYDRATE
});

export const hydrateNewChallenge = () => ((dispatch) => {
  const bankSize = GRID_HEIGHT * GRID_WIDTH;
  const seenChallenges = JSON.parse(localStorage.seenChallenges || '[]');
  let waiting = true;
  let hydrateState;
  const dispatchHydrate = () => dispatch(hydrate(hydrateState));
  getChallenge(bankSize, seenChallenges, (challenge) => {
    hydrateState = loadNewChallenge(challenge);
    console.log(hydrateState.toJS());
    !waiting && dispatchHydrate();
  });
  window.setTimeout(() => {
    if (hydrateState) {
      dispatchHydrate();
    } else {
      waiting = false;
    }
  }, 2000);
});

export const addTile = (tileId, char) => ({
  char,
  tileId,
  type: TILE_ADD
});

export const removeTile = (tileId) => ({
  tileId,
  type: TILE_REMOVE
});

export const selectTile = (tileId) => ({
  tileId,
  type: TILE_SELECT
});
