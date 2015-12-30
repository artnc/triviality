import Immutable from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {
  addTile,
  initState,
  removeTile,
  selectTile,
  useHint
} from './actions';
import {BANK_EXTRAS_ROW, GRID_HEIGHT, GRID_WIDTH} from './constants';
import App from './containers/App';
import rootReducer from './reducers';
import createStoreWithMiddleware from './store';
import './styles/global.scss';
import {exit} from './util/navigation';

/* Initialize Redux */

const store = createStoreWithMiddleware(rootReducer);
store.dispatch(initState());

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
  const state = store.getState().get('currentQuestion', Immutable.Map({}));
  switch (keyCode) {
    case 8: { // Backspace
      const guessTileIds = state.get('guessTileIds');
      const removeIndex = guessTileIds.findLastIndex((id) => (
        typeof id === 'number'
      ));
      if (!state.get('solved') && removeIndex !== -1) {
        store.dispatch(removeTile(guessTileIds.get(removeIndex)));
      }
      break;
    }
    case 13: { // Enter
      const guess = state.get('guess');
      const selectedTileId = state.get('selectedTileId');
      switch (selectedTileId) {
        case 'EXIT': {
          exit();
          break;
        }
        case 'HINT': {
          if (!state.get('solved') && store.getState().get('hints', 0) >= 1) {
            store.dispatch(useHint());
          }
          break;
        }
        default: {
          const tile = state.get('tiles').get(selectedTileId);
          if (!tile.get('used') && guess.includes(null)) {
            store.dispatch(addTile(selectedTileId, tile.get('char')));
          }
          break;
        }
      }
      break;
    }
    case 37: // Left
    case 38: // Up
    case 39: // Right
    case 40: { // Down
      const selectedTileId = state.get('selectedTileId');
      let x, y, nextTileId;

      if (selectedTileId === 'EXIT') {
        nextTileId = selectedTileId;
        if (keyCode === 37) {
          nextTileId = 'HINT';
        } else if (keyCode === 39) {
          nextTileId = BANK_EXTRAS_ROW * GRID_WIDTH;
        }
      } else if (selectedTileId === 'HINT') {
        nextTileId = selectedTileId;
        if (keyCode === 37) {
          nextTileId = (BANK_EXTRAS_ROW + 1) * GRID_WIDTH - 1;
        } else if (keyCode === 39) {
          nextTileId = 'EXIT';
        }
      } else if (selectedTileId === BANK_EXTRAS_ROW * GRID_WIDTH &&
        keyCode === 37) {
        nextTileId = 'EXIT';
      } else if (selectedTileId === (BANK_EXTRAS_ROW + 1) * GRID_WIDTH - 1 &&
        keyCode === 39) {
        nextTileId = 'HINT';
      } else {
        // Get current tile position
        x = selectedTileId % GRID_WIDTH;
        y = Math.floor(selectedTileId / GRID_WIDTH);

        // Calculate next tile position
        x += (keyCode % 2) * (keyCode - 38);
        y += (1 - keyCode % 2) * (keyCode - 39);

        // Handle wrapping
        x = (x + GRID_WIDTH) % GRID_WIDTH;
        y = (y + GRID_HEIGHT) % GRID_HEIGHT;

        nextTileId = y * GRID_WIDTH + x;
      }

      store.dispatch(selectTile(nextTileId));
      break;
    }
    default: {
      if (e.ctrlKey || e.altKey || e.metaKey || keyCode < 48 || keyCode > 90) {
        eventHandled = false;
        break;
      }

      // Alphanumeric
      const char = String.fromCharCode(keyCode);
      if (!(state.get('tileString').includes(char) &&
        state.get('guess').includes(null))) {
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
