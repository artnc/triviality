
import Immutable from 'immutable';

import {GRID_HEIGHT, GRID_WIDTH} from 'constants';
import {getQuestion} from 'util/jservice';
import {track} from 'util/tracking';

/* Action types */

export const HINT_USE = 'HINT_USE';
export const HYDRATE = 'HYDRATE';
export const TILE_ADD = 'TILE_ADD';
export const TILE_REMOVE = 'TILE_REMOVE';
export const TILE_SELECT = 'TILE_SELECT';

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
export const hydrateNewQuestion = initForNewUser => (
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
      track('GET_QUESTION');
      return dispatch(hydrate(hydrateState, true));
    };
    getQuestion(bankSize, seenQuestions, question => {
      currentQuestion = question;
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

export const addTile = tileId => ({
  tileId,
  type: TILE_ADD
});

export const removeTile = () => ({type: TILE_REMOVE});

export const selectTile = tileId => ({
  tileId,
  type: TILE_SELECT
});
