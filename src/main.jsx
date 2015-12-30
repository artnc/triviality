import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {
  addTile,
  initializeQuestionState,
  removeTile,
  selectTile
} from './actions';
import {GRID_HEIGHT, GRID_WIDTH} from './constants';
import App from './containers/App';
import rootReducer from './reducers';
import createStoreWithMiddleware from './store';
import './styles/global.scss';

/* Initialize Redux */

const store = createStoreWithMiddleware(rootReducer);
store.dispatch(initializeQuestionState());

/* Initialize React */

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

/* Add global event listeners */

document.addEventListener('keydown', e => {
  const keyCode = e.which || e.keyCode || 0;
  let eventHandled = true;
  const state = store.getState();
  switch (keyCode) {
    case 8: { // Backspace
      const guessTileIds = state.get('guessTileIds');
      if (!state.get('solved') && guessTileIds.size) {
        store.dispatch(removeTile(guessTileIds.last()));
      }
      break;
    }
    case 13: { // Enter
      const filteredSolution = state.get('filteredSolution');
      const guess = state.get('guess');
      const selectedTileId = state.get('selectedTileId');
      const tile = state.get('tiles').get(selectedTileId);
      if (!tile.get('used') && guess.length < filteredSolution.length) {
        store.dispatch(addTile(selectedTileId, tile.get('char')));
      }
      break;
    }
    case 37: // Left
    case 38: // Up
    case 39: // Right
    case 40: { // Down
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
      const filteredSolution = state.get('filteredSolution');
      const guess = state.get('guess');
      if (!state.get('tileString').includes(char) ||
        guess.length >= filteredSolution.length) {
        break;
      }
      state.get('tiles').toJS().some((tile, id) => {
        if (!tile.used && tile.char === char) {
          store.dispatch(addTile(id, tile.char));
          return true;
        }
      });
      break;
    }
  }
  eventHandled && e.preventDefault();
});

// From https://developer.amazon.com/public/solutions/platforms/webapps/faq
window.tvMode && window.addEventListener('load', () => {
  console.log('Amazon Fire TV mode enabled.');
  const BACK_FLAG = 'backhandler';
  window.addEventListener('popstate', () => {
    if (window.history.state === BACK_FLAG) {
      return;
    }
    const guessTileIds = store.getState().get('guessTileIds');
    guessTileIds.size && store.dispatch(removeTile(guessTileIds.last()));
    window.history.pushState(BACK_FLAG, null, null);
  });
  window.history.pushState(BACK_FLAG, null, null);
});
