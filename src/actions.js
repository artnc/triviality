import Immutable from 'immutable';

/* Action types */

export const HISTORY_STATE_POP = 'HISTORY_STATE_POP';
export const HISTORY_STATE_PUSH = 'HISTORY_STATE_PUSH';
export const HYDRATE = 'HYDRATE';
export const TILE_ADD = 'TILE_ADD';
export const TILE_SELECT = 'TILE_SELECT';

/* Action utils */

// Arbitrary constant unlikely to ever appear naturally
const RUN_DELIMITER = '@#"';

// Converts the server's challenge format into a complete Redux state
export const initializeChallengeState = (challengeJson) => {
  const solutionChars = challengeJson.tileString.split('');
  const solutionRuns = challengeJson.solution.trim().replace(
    /(\w+)/g,
    `${RUN_DELIMITER}$1${RUN_DELIMITER}`
  ).split(RUN_DELIMITER).filter((run) => run.length).map((run) => (
    run.charAt(0).match(/\w/) ? run.length : run
  ));

  return Immutable.fromJS({
    filteredSolution: challengeJson.solution.replace(/[^\w]/g, ''),
    guess: '',
    prompt: challengeJson.prompt,
    selectedTileId: 0,
    solutionRuns,
    solved: false,
    tiles: solutionChars.map((char, id) => ({char, id, used: false})),
    tileString: challengeJson.tileString
  });
};

/* Action creators */

export const popHistoryState = () => ({type: HISTORY_STATE_POP});

export const pushHistoryState = () => ({type: HISTORY_STATE_PUSH});

export const hydrate = (hydrateState) => ({
  state: hydrateState,
  type: HYDRATE
});

export const addTile = (tileId, char) => ({
  char,
  tileId,
  type: TILE_ADD
});

export const selectTile = (tileId) => ({
  tileId,
  type: TILE_SELECT
});
