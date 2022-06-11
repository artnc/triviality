import "babel-polyfill";

import Immutable from "immutable";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { addTile, initState, removeTile, selectTile, useHint } from "actions";
import {
  BANK_EXTRAS_ROW,
  EXIT_TILE_ID,
  HINT_TILE_ID,
  GRID_HEIGHT,
  GRID_WIDTH,
} from "constants";
import App from "containers/App";
import rootReducer from "reducers";
import createStoreWithMiddleware from "store";
import "styles/global.scss";
import { exit } from "util/navigation";
import { track } from "util/tracking";

/* Initialize Redux */

const store = createStoreWithMiddleware(rootReducer);
store.dispatch(initState());

/* Initialize React */

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

/* Add global event listeners */

document.addEventListener("keydown", e => {
  const keyCode = e.which || e.keyCode || 0;
  let eventHandled = true;
  const state = store.getState().get("currentQuestion", Immutable.Map({}));
  switch (keyCode) {
    case 8: {
      // Backspace
      store.dispatch(removeTile());
      break;
    }
    case 13: {
      // Enter
      const selectedTileId = state.get("selectedTileId");
      switch (selectedTileId) {
        case EXIT_TILE_ID: {
          exit();
          break;
        }
        case HINT_TILE_ID: {
          store.dispatch(useHint());
          break;
        }
        default: {
          store.dispatch(addTile(selectedTileId));
          break;
        }
      }
      break;
    }
    case 37: // Left
    case 38: // Up
    case 39: // Right
    case 40: {
      // Down
      const selectedTileId = state.get("selectedTileId");
      let x, y, nextTileId;

      if (selectedTileId === EXIT_TILE_ID) {
        nextTileId = selectedTileId;
        if (keyCode === 37) {
          nextTileId = HINT_TILE_ID;
        } else if (keyCode === 39) {
          nextTileId = BANK_EXTRAS_ROW * GRID_WIDTH;
        }
      } else if (selectedTileId === HINT_TILE_ID) {
        nextTileId = selectedTileId;
        if (keyCode === 37) {
          nextTileId = (BANK_EXTRAS_ROW + 1) * GRID_WIDTH - 1;
        } else if (keyCode === 39) {
          nextTileId = EXIT_TILE_ID;
        }
      } else if (
        selectedTileId === BANK_EXTRAS_ROW * GRID_WIDTH &&
        keyCode === 37
      ) {
        nextTileId = EXIT_TILE_ID;
      } else if (
        selectedTileId === (BANK_EXTRAS_ROW + 1) * GRID_WIDTH - 1 &&
        keyCode === 39
      ) {
        nextTileId = HINT_TILE_ID;
      } else {
        // Get current tile position
        x = selectedTileId % GRID_WIDTH;
        y = Math.floor(selectedTileId / GRID_WIDTH);

        // Calculate next tile position
        x += (keyCode % 2) * (keyCode - 38);
        y += (1 - (keyCode % 2)) * (keyCode - 39);

        // Handle wrapping
        x = (x + GRID_WIDTH) % GRID_WIDTH;
        y = (y + GRID_HEIGHT) % GRID_HEIGHT;

        nextTileId = y * GRID_WIDTH + x;
      }

      store.dispatch(selectTile(nextTileId));
      pushKonami(keyCode);
      break;
    }
    case 191: {
      e.shiftKey && store.dispatch(useHint());
      break;
    }
    default: {
      if (e.ctrlKey || e.altKey || e.metaKey || keyCode < 48 || keyCode > 90) {
        eventHandled = false;
        break;
      }

      // Alphanumeric
      const char = String.fromCharCode(keyCode);
      if (
        !(
          state.get("tileString").includes(char) &&
          state.get("guessTileIds").includes(null)
        )
      ) {
        break;
      }
      state
        .get("tiles")
        .toJS()
        .some((tile, id) => {
          if (!tile.used && tile.char === char) {
            store.dispatch(addTile(id));
            return true;
          }
        });
      break;
    }
  }
  eventHandled && e.preventDefault();
});

// Konami code easter egg
const KONAMI = "3838404037393739";
const konamiQueue = "00000000".split("");
const pushKonami = keyCode => {
  konamiQueue.push(keyCode);
  konamiQueue.shift();
  konamiQueue.join("") === KONAMI && document.body.classList.toggle("dark");
};

// From https://developer.amazon.com/public/solutions/platforms/webapps/faq
window.tvMode = navigator.userAgent.indexOf("AmazonWebAppPlatform") !== -1;
window.tvMode &&
  window.addEventListener("load", () => {
    console.log("Amazon Fire TV mode enabled.");
    document.body.classList.add("dark");
    const BACK_FLAG = "backhandler";
    window.addEventListener("popstate", () => {
      if (window.history.state === BACK_FLAG) {
        return;
      }
      store.dispatch(removeTile());
      window.history.pushState(BACK_FLAG, null, null);
    });
    for (let i = 0; i < 5; ++i) {
      window.history.pushState(BACK_FLAG, null, null);
    }
  });

window.addEventListener("load", () => track("LOAD_GAME_PAGE"));
