import Immutable from 'immutable';
import {
  HINT_USE,
  HYDRATE,
  TILE_ADD,
  TILE_REMOVE,
  TILE_SELECT
} from './actions';
import {SOUNDS, playSound} from './util/audio';

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

const tile = (state, action) => {
  switch (action.type) {
    case TILE_ADD:
      return state.set('used', true);
    case TILE_REMOVE:
      return state.set('used', false);
    default:
      return state;
  }
};

const tiles = (state, action) => {
  if ('tileId' in action) {
    return state.set(action.tileId, tile(state.get(action.tileId), action));
  }
  return state;
};

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
const currenQuestionCombinedReducer = immutableCombineReducers({
  tiles
});
const currentQuestion = (state, action) => {
  state = currenQuestionCombinedReducer(state, action);
  switch (action.type) {
    case HINT_USE: {
      const hintIndexPool = [];
      const guessTileIds = state.get('guessTileIds');
      guessTileIds.toJS().forEach((id, i) => {
        (typeof id !== 'string') && hintIndexPool.push(i);
      });
      const hintIndex = hintIndexPool[Math.floor(Math.random() *
        hintIndexPool.length)];
      const hintChar = state.get('filteredSolution')[hintIndex];
      const hintTile = state.get('tiles').find(t => (
        t.get('char') === hintChar
      ));
      const guess = state.get('guess').set(hintIndex, hintChar);
      state = state.merge({
        guess,
        guessTileIds: guessTileIds.set(hintIndex, hintChar),
        tiles: state.get('tiles').set(hintTile.get('id'), hintTile.merge({
          solved: true,
          used: true
        }))
      });
      state = state.set('solved', isSolved(guess, state));
      playNewTileSound(state, SOUNDS.HINT);
      break;
    }
    case TILE_ADD: {
      const addIndex = state.get('guess').indexOf(null);
      const guess = state.get('guess').set(addIndex, action.char);
      state = state.merge({
        guess,
        guessTileIds: state.get('guessTileIds').set(addIndex, action.tileId),
        selectedTileId: action.tileId
      });
      state = state.set('solved', isSolved(guess, state));
      playNewTileSound(state, SOUNDS.LETTER);
      break;
    }
    case TILE_REMOVE: {
      const guessTileIds = state.get('guessTileIds');
      const removeIndex = guessTileIds.findLastIndex((id) => (
        typeof id === 'number'
      ));
      if (state.get('solved') || removeIndex === -1) {
        break;
      }
      state = state.merge({
        guess: state.get('guess').set(removeIndex, null),
        guessTileIds: guessTileIds.set(removeIndex, null)
      });
      playSound(SOUNDS.ERASE);
      break;
    }
    case TILE_SELECT: {
      const tileId = action.tileId;
      if (state.get('solved') || tileId === state.get('selectedTileId')) {
        break;
      }
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
  if (!state.get('currentQuestion').get('solved')) {
    return state;
  }
  const hintsToAward = state.get('currentQuestion').get('difficulty') / 1600;
  return state.set('hints', state.get('hints') + hintsToAward);
};
const rootReducer = (state = Immutable.Map({}), action) => {
  state = rootCombinedReducer(state, action);
  let persistState = false;
  switch (action.type) {
    case HINT_USE: {
      state = state.set('hints', state.get('hints') - 1);
      state = getStateWithAwardedHints(state);
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
