import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {
  addTile,
  initializeChallengeState,
  popHistoryState,
  pushHistoryState,
  selectTile
} from './actions';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import App from './containers/App';
import rootReducer from './reducers';
import createStoreWithMiddleware from './store';
import './styles/global.scss';

/* Initialize Redux */

const initialState = initializeChallengeState(window.initialData);
const store = createStoreWithMiddleware(rootReducer, initialState);

/* Initialize React */

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

/* Add global event listeners */

const dispatchTileAdd = (tileId, letter) => {
  store.dispatch(pushHistoryState());
  store.dispatch(addTile(tileId, letter));
};

document.addEventListener('keydown', (e) => {
  const keyCode = e.which || e.keyCode || 0;
  let eventHandled = true;
  switch (keyCode) {
    case 8: // Backspace
      store.dispatch(popHistoryState());
      break;
    case 13: { // Enter
      const state = store.getState();
      const filteredSolution = state.get('filteredSolution');
      const guess = state.get('guess');
      const selectedTileId = state.get('selectedTileId');
      const tile = state.get('tiles').get(selectedTileId);
      if (!tile.get('used') && guess.length < filteredSolution.length) {
        dispatchTileAdd(tile.get('id'), tile.get('letter'));
      }
      break;
    }
    case 37: // Left
    case 38: // Up
    case 39: // Right
    case 40: { // Down
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
      break;
    }
    default: {
      if (e.ctrlKey || e.altKey || e.metaKey || keyCode < 48 || keyCode > 90) {
        eventHandled = false;
        break;
      }

      // Alphanumeric
      const char = String.fromCharCode(keyCode);
      const state = store.getState();
      const filteredSolution = state.get('filteredSolution');
      const guess = state.get('guess');
      if (!state.get('tileString').includes(char) ||
        guess.length >= filteredSolution.length) {
        break;
      }
      state.get('tiles').toJS().some((tile) => {
        if (!tile.used && tile.letter === char) {
          dispatchTileAdd(tile.id, tile.letter);
          return true;
        }
      });
      break;
    }
  }
  eventHandled && e.preventDefault();
});
