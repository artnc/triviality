import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import {HISTORY_STATE_POP, HISTORY_STATE_PUSH, TILE_SELECT} from './actions';

const middleWare = [];

if (DEV) {
  const HIDDEN_ACTIONS = [
    HISTORY_STATE_POP,
    HISTORY_STATE_PUSH,
    TILE_SELECT
  ];
  console.log(
    `%caction logging disabled for: ${HIDDEN_ACTIONS.join(', ')}`,
    'font-weight:700'
  );
  const logger = createLogger({
    collapsed: true,
    predicate: (getState, action) => !HIDDEN_ACTIONS.includes(action.type),
    stateTransformer: (state) => state.toJS()
  });
  middleWare.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(...middleWare)(createStore);
export default createStoreWithMiddleware;
