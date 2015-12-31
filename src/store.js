import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import {TILE_SELECT} from 'actions';

const middleWare = [thunk];

if (__LOG_STATES__) {
  const HIDDEN_ACTIONS = [
    TILE_SELECT
  ];
  console.log(
    `%caction logging disabled for: ${HIDDEN_ACTIONS.join(', ')}`,
    'font-weight:700'
  );
  middleWare.push(createLogger({
    collapsed: true,
    predicate: (getState, action) => !HIDDEN_ACTIONS.includes(action.type),
    stateTransformer: state => state.toJS()
  }));
}

const createStoreWithMiddleware = applyMiddleware(...middleWare)(createStore);
export default createStoreWithMiddleware;
