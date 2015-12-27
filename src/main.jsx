import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import {initializeChallengeState, selectTile} from './actions';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import App from './containers/App';
import rootReducer from './reducers';
import styles from './styles/global.scss';

/* Initialize Redux */

const middleWare = [];

if (DEV) {
  const logger = createLogger({
    collapsed: true,
    stateTransformer: (state) => state.toJS()
  });
  middleWare.push(logger);
}

const initialState = initializeChallengeState(window.initialData);
const createStoreWithMiddleware = applyMiddleware(...middleWare)(createStore);
const store = createStoreWithMiddleware(rootReducer, initialState);

/* Initialize React */

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

/* Add global event listeners */

document.addEventListener('keydown', (e) => {
  const keyCode = e.which || e.keyCode || 0;

  // Arrow keys
  if (keyCode > 36 && keyCode < 41) {
    const state = store.getState();
    const selectedTileId = state.get('selectedTileId');

    // Get current tile position
    let x = selectedTileId % GRID_WIDTH;
    let y = Math.floor(selectedTileId / GRID_WIDTH);

    // Calculate next tile position
    x += (keyCode % 2) * (keyCode - 38);
    y += (1 - keyCode % 2) * (keyCode - 39);

    // Handle wrapping
    x = (x + GRID_WIDTH) % GRID_WIDTH;
    y = (y + GRID_HEIGHT) % GRID_HEIGHT;

    store.dispatch(selectTile(y * GRID_WIDTH + x));
    return false;
  }
});
