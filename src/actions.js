import Immutable from 'immutable';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import {getQuestion} from './util/jservice';

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

// Converts the server's question format into a complete Redux state
const loadNewQuestion = questionJson => {
  // Post-process question
  const solutionChars = questionJson.tileString.split('');
  const solutionRuns = questionJson.solution.trim().replace(
    /(\w+)/g,
    `${RUN_DELIMITER}$1${RUN_DELIMITER}`
  ).split(RUN_DELIMITER).filter(run => run.length).map((run) => (
    run.charAt(0).match(/\w/) ? run.length : run
  ));

  // Mark question as seen
  const seenQuestions = JSON.parse(localStorage.seenQuestions || '[]');
  if (!seenQuestions.includes(questionJson.id)) {
    seenQuestions.push(questionJson.id);
    localStorage.seenQuestions = JSON.stringify(seenQuestions);
  }

  return Immutable.fromJS({
    category: questionJson.category,
    difficulty: questionJson.difficulty,
    filteredSolution: questionJson.solution.replace(/[^\w]/g, ''),
    guess: '',
    guessTileIds: [],
    id: questionJson.id,
    prompt: questionJson.prompt,
    selectedTileId: 0,
    solutionRuns,
    solved: false,
    tiles: solutionChars.map((char, id) => ({char, id, used: false})),
    tileString: questionJson.tileString
  });
};

/* Action creators */

export const popHistoryState = () => ({type: HISTORY_STATE_POP});

export const pushHistoryState = () => ({type: HISTORY_STATE_PUSH});

export const hydrate = hydrateState => ({
  state: hydrateState,
  type: HYDRATE
});

export const hydrateNewQuestion = (delay = 2000) => (dispatch => {
  const bankSize = GRID_HEIGHT * GRID_WIDTH;
  const seenQuestions = JSON.parse(localStorage.seenQuestions || '[]');
  let waiting = !!delay;
  let hydrateState;
  const dispatchHydrate = () => dispatch(hydrate(hydrateState));
  getQuestion(bankSize, seenQuestions, question => {
    hydrateState = loadNewQuestion(question);
    !waiting && dispatchHydrate();
  });
  delay && window.setTimeout(() => {
    if (hydrateState) {
      dispatchHydrate();
    } else {
      waiting = false;
    }
  }, delay);
});
export const initializeQuestionState = () => {
  const questionState = window.localStorage.questionState;
  if (typeof questionState === 'string') {
    return hydrate(Immutable.fromJS(JSON.parse(questionState)));
  }
  return hydrateNewQuestion(0);
};

export const addTile = (tileId, char) => ({
  char,
  tileId,
  type: TILE_ADD
});

export const removeTile = tileId => ({
  tileId,
  type: TILE_REMOVE
});

export const selectTile = tileId => ({
  tileId,
  type: TILE_SELECT
});
