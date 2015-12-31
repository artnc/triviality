import Immutable from 'immutable';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import {getQuestion} from './util/jservice';

/* Action types */

export const HINT_USE = 'HINT_USE';
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
  const filteredSolution = questionJson.solution.replace(/[^\w]/g, '');

  return {
    category: questionJson.category,
    difficulty: questionJson.difficulty,
    filteredSolution,
    guess: (new Array(filteredSolution.length)).fill(null),
    guessTileIds: (new Array(filteredSolution.length)).fill(null),
    id: questionJson.id,
    prompt: questionJson.prompt,
    selectedTileId: 0,
    solutionRuns,
    solved: false,
    tiles: solutionChars.map((char, id) => ({char, id, used: false})),
    tileString: questionJson.tileString
  };
};

/* Action creators */

export const useHint = () => ({type: HINT_USE});

export const hydrate = (hydrateState, partial = false) => ({
  partial,
  state: hydrateState,
  type: HYDRATE
});

const INITIAL_STATE = Immutable.fromJS({
  hints: 20
});
export const hydrateNewQuestion = (initForNewUser) => (
  (dispatch, getState) => {
    const delay = initForNewUser ? 0 : 3000;
    const bankSize = GRID_HEIGHT * GRID_WIDTH;
    const seenQuestions = getState().get(
      'seenQuestions',
      Immutable.List([])
    ).toJS();
    let waiting = !!delay;
    let currentQuestion;
    const dispatchHydrate = () => {
      seenQuestions.push(currentQuestion.id);
      let hydrateState = getState();
      if (initForNewUser) {
        hydrateState = hydrateState.merge(INITIAL_STATE);
      }
      hydrateState = hydrateState.merge({
        currentQuestion: Immutable.fromJS(currentQuestion),
        seenQuestions: Immutable.fromJS(seenQuestions)
      });
      return dispatch(hydrate(hydrateState, true));
    };
    getQuestion(bankSize, seenQuestions, question => {
      currentQuestion = loadNewQuestion(question, dispatch);
      !waiting && dispatchHydrate();
    });
    delay && window.setTimeout(() => {
      if (currentQuestion) {
        dispatchHydrate();
      } else {
        waiting = false;
      }
    }, delay);
  }
);
export const initState = () => {
  const savedState = window.localStorage.state;
  if (typeof savedState === 'string') {
    return hydrate(Immutable.fromJS(JSON.parse(savedState)));
  }
  return hydrateNewQuestion(true);
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
