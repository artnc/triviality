import Immutable from 'immutable';
import {TILE_ADD} from './actions';

const INITIAL_TILES_STATE = Immutable.fromJS([
  {
    id: 0,
    letter: 'A',
    used: false
  },
  {
    id: 1,
    letter: 'B',
    used: false
  },
  {
    id: 2,
    letter: 'C',
    used: false
  }
]);

const tile = (state, action) => {
  switch (action.type) {
    case TILE_ADD:
      console.log(state.toJS());
      return state.set('used', !state.get('used'));
    default:
      return state;
  }
};

const tiles = (state = INITIAL_TILES_STATE, action) => {
  if ('tileId' in action) {
    return state.set(action.tileId, tile(state.get(action.tileId), action));
  }
  return state;
};

// Rewrite of Redux.combineReducers to support stores of type Immutable.Map
const immutableCombineReducers = (reducers) => {
  return (state = Immutable.Map({}), action) => {
    return Immutable.fromJS(Object.keys(reducers).reduce(
      (nextState, key) => {
        return nextState.set(key, reducers[key](state.get(key), action));
      },
      Immutable.Map({})
    ));
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
