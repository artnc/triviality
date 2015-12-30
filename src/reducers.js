import Immutable from 'immutable';
import {
  HINT_USE,
  HISTORY_STATE_POP,
  HISTORY_STATE_PUSH,
  HYDRATE,
  TILE_ADD,
  TILE_REMOVE,
  TILE_SELECT,
  hydrate
} from './actions';

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
        tiles: state.get('tiles').set(hintTile.id, hintTile.merge({
          used: true
        }))
      });
      state = state.set('solved', isSolved(guess, state));
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
      break;
    }
    case TILE_SELECT: {
      if (!state.get('solved')) {
        state = state.set('selectedTileId', action.tileId);
      }
      break;
    }
  }
  return state;
};

/* Root reducer given to Redux.createStore */

const persistState = state => {
  window.localStorage.state = JSON.stringify(state.toJS());
};

// Undo history is implemented using a stack of states stored in the HISTORY_KEY
// array, which is the only state item exempt from versioning. An individual
// state is pushed to HISTORY_KEY with its own HISTORY_KEY stripped, and it is
// popped from HISTORY_KEY with the resulting value of HISTORY_KEY merged back
// in. The store is then hydrated with the popped (i.e. previous) state.
const HISTORY_KEY = '_stateHistory';
const rootCombinedReducer = immutableCombineReducers({
  currentQuestion
});
const rootReducer = (state = Immutable.Map({}), action) => {
  state = rootCombinedReducer(state, action);
  switch (action.type) {
    case HINT_USE: {
      state = state.set('hints', state.get('hints') - 1);
      persistState(state);
      break;
    }
    case HISTORY_STATE_POP: {
      const history = state.get(HISTORY_KEY);
      if (!(history && history.size)) {
        break;
      }
      const previousState = history.last();
      const hydrateState = previousState.set(HISTORY_KEY, history.pop());
      state = rootReducer(undefined, hydrate(hydrateState));
      break;
    }
    case HISTORY_STATE_PUSH: {
      const history = state.get(HISTORY_KEY, Immutable.List([]));
      state = state.set(HISTORY_KEY, history.push(state.delete(HISTORY_KEY)));
      break;
    }
    case HYDRATE: {
      const hydrateState = action.partial ? state.merge(action.state) :
        action.state;
      state = rootReducer(hydrateState, {});
      persistState(state);
      break;
    }
    case TILE_ADD:
    case TILE_REMOVE: {
      persistState(state);
      break;
    }
  }
  return state;
};
export default rootReducer;
