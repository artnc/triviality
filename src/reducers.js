import Immutable from 'immutable';
import {TILE_ADD} from './actions';

const tile = (state, action) => {
  switch (action.type) {
    case TILE_ADD:
      console.log(state.toJS());
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
const app = (state = Immutable.Map({}), action) => {
  switch (action.type) {
    default:
      return combinedReducer(state, action);
  }
};

export default app;
