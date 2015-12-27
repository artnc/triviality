import Immutable from 'immutable';
import {
  HISTORY_STATE_POP,
  HISTORY_STATE_PUSH,
  HYDRATE,
  TILE_ADD,
  TILE_SELECT,
  hydrate

} from './actions';

/* Substate reducers */

const tile = (state, action) => {
  switch (action.type) {
    case TILE_ADD:
      return state.set('used', !state.get('used'));
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

/* Root reducer given to Redux.createStore */

// Rewrite of Redux.combineReducers to support stores of type Immutable.Map
const immutableCombineReducers = (reducers) => {
  const reducerKeys = Object.keys(reducers);
  return (state = Immutable.Map({}), action) => {
    return reducerKeys.reduce(
      (next, key) => next.set(key, reducers[key](state.get(key), action)),
      state
    );
  };
};
const combinedReducer = immutableCombineReducers({
  tiles
});

// Undo history is implemented using a stack of states stored in the HISTORY_KEY
// array, which is the only state item exempt from versioning. An individual
// state is pushed to HISTORY_KEY with its own HISTORY_KEY stripped, and it is
// popped from HISTORY_KEY with the resulting value of HISTORY_KEY merged back
// in. The store is then hydrated with the popped (i.e. previous) state.
const HISTORY_KEY = '_stateHistory';
const rootReducer = (state = Immutable.Map({}), action) => {
  switch (action.type) {
    case HISTORY_STATE_POP: {
      const history = state.get(HISTORY_KEY);
      if (!(history && history.size)) {
        break;
      }
      const previousState = history.last();
      const hydrateState = previousState.set(HISTORY_KEY, history.pop());
      state = rootReducer(null, hydrate(hydrateState));
      break;
    }
    case HISTORY_STATE_PUSH: {
      const history = state.get(HISTORY_KEY, Immutable.List([]));
      state = state.set(HISTORY_KEY, history.push(state.delete(HISTORY_KEY)));
      break;
    }
    case HYDRATE:
      state = rootReducer(action.state, {});
      break;
    case TILE_ADD:
      state = state.merge({
        guess: `${state.get('guess')}${action.letter}`,
        selectedTileId: action.tileId
      });
      break;
    case TILE_SELECT:
      state = state.set('selectedTileId', action.tileId);
      break;
  }
  return combinedReducer(state, action);
};
export default rootReducer;
