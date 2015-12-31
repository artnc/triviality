import Immutable from 'immutable';

import {
  HINT_USE,
  HYDRATE,
  TILE_ADD,
  TILE_REMOVE,
  TILE_SELECT
} from 'actions';
import {SOUNDS, playSound} from 'util/audio';

/* Reducer utils */

// Rewrite of Redux.combineReducers to support stores of type Immutable.Map
const immutableCombineReducers = reducers => {
  const reducerKeys = Object.keys(reducers);
  return (state = Immutable.Map({}), action) => {
    return reducerKeys.reduce(
      (next, key) => next.set(key, reducers[key](state.get(key), action)),
      state
    );
  };
};

/* Substate reducers */

const isSolved = (guess, state) => (
  guess.join('') === state.get('filteredSolution')
);
const playNewTileSound = (state, defaultSound) => {
  if (state.get('solved')) {
    playSound(SOUNDS.WIN);
  } else if (state.get('guess').includes(null)) {
    playSound(defaultSound);
  } else {
    playSound(SOUNDS.ERROR);
  }
};
const currentQuestion = (state, action) => {
  switch (action.type) {
    case TILE_ADD: {
      // Validate action
      const tileUsedKeyPath = ['tiles', action.tileId, 'used'];
      if (state.getIn(tileUsedKeyPath) || !state.get('guess').includes(null)) {
        break;
      }

      // Mark tile used
      state = state.setIn(tileUsedKeyPath, true);
      const addIndex = state.get('guess').indexOf(null);
      const tileChar = state.getIn(['tiles', action.tileId, 'char']);
      const guess = state.get('guess').set(addIndex, tileChar);
      state = state.merge({
        guess,
        guessTileIds: state.get('guessTileIds').set(addIndex, action.tileId),
        selectedTileId: action.tileId
      });

      // Check whether solved
      state = state.set('solved', isSolved(guess, state));
      playNewTileSound(state, SOUNDS.LETTER);
      break;
    }
    case TILE_REMOVE: {
      // Validate action
      const guessTileIds = state.get('guessTileIds', Immutable.List([]));
      const removeIndex = guessTileIds.findLastIndex(id => (
        typeof id === 'number'
      ));
      if (state.get('solved') || removeIndex === -1) {
        break;
      }

      // Mark tile unused
      const tileUsedKeyPath = ['tiles', guessTileIds.get(removeIndex), 'used'];
      state = state.setIn(tileUsedKeyPath, false);
      state = state.merge({
        guess: state.get('guess').set(removeIndex, null),
        guessTileIds: guessTileIds.set(removeIndex, null)
      });
      playSound(SOUNDS.ERASE);
      break;
    }
    case TILE_SELECT: {
      // Validate action
      const tileId = action.tileId;
      if (state.get('solved') || tileId === state.get('selectedTileId')) {
        break;
      }

      // Select tile
      state = state.set('selectedTileId', tileId);
      playSound(SOUNDS.BUTTON);
      break;
    }
  }
  return state;
};

/* Root reducer given to Redux.createStore */

const rootCombinedReducer = immutableCombineReducers({
  currentQuestion
});
const getStateWithAwardedHints = state => {
  if (!state.getIn(['currentQuestion', 'solved'], false) ||
    state.getIn(['currentQuestion', 'hintsAwarded'], false)) {
    return state;
  }
  const hintsToAward = state.getIn(['currentQuestion', 'difficulty']) / 1600;
  state = state.setIn(['currentQuestion', 'hintsAwarded'], true);
  return state.set('hints', state.get('hints') + hintsToAward);
};
const rootReducer = (state = Immutable.Map({}), action) => {
  state = rootCombinedReducer(state, action);
  let persistState = false;
  switch (action.type) {
    case HINT_USE: {
      // Validate action
      const hints = state.get('hints', 0);
      if (hints < 1 || state.getIn(['currentQuestion', 'solved'], false)) {
        break;
      }

      // Consume hint
      state = state.set('hints', hints - 1);
      let question = state.get('currentQuestion');
      const hintIndexPool = [];
      const guessTileIds = question.get('guessTileIds');
      guessTileIds.toJS().forEach((id, i) => {
        (typeof id !== 'string') && hintIndexPool.push(i);
      });
      const hintIndex = hintIndexPool[Math.floor(Math.random() *
        hintIndexPool.length)];
      const hintChar = question.get('filteredSolution')[hintIndex];
      const hintTile = question.get('tiles').find(t => (
        t.get('char') === hintChar
      ));
      const guess = question.get('guess').set(hintIndex, hintChar);
      question = question.merge({
        guess,
        guessTileIds: guessTileIds.set(hintIndex, hintChar),
        tiles: question.get('tiles').set(hintTile.get('id'), hintTile.merge({
          solved: true,
          used: true
        }))
      });

      // Check whether solved
      question = question.set('solved', isSolved(guess, question));
      playNewTileSound(question, SOUNDS.HINT);
      state = getStateWithAwardedHints(state.set('currentQuestion', question));
      persistState = true;
      break;
    }
    case HYDRATE: {
      const hydrateState = action.partial ? state.merge(action.state) :
        action.state;
      state = rootReducer(hydrateState, {});
      persistState = true;
      break;
    }
    case TILE_ADD:
    case TILE_REMOVE: {
      state = getStateWithAwardedHints(state);
      persistState = true;
      break;
    }
  }

  // Aggressively save state to disk
  if (persistState) {
    window.localStorage.state = JSON.stringify(state.toJS());
  }

  return state;
};
export default rootReducer;
