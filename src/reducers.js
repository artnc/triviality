import Immutable from "immutable";

import { HINT_USE, HYDRATE, TILE_ADD, TILE_REMOVE, TILE_SELECT } from "actions";
import { SOUNDS, playSound } from "util/audio";
import { LOCALSTORAGE, setItem } from "util/storage";
import { track } from "util/tracking";

/* Reducer utils */

// Rewrite of Redux.combineReducers to support stores of type Immutable.Map
const immutableCombineReducers = reducers => {
  const reducerKeys = Object.keys(reducers);
  return (state = Immutable.Map({}), action) => {
    return reducerKeys.reduce(
      (next, key) => next.set(key, reducers[key](state.get(key), action)),
      state
    );
  };
};

/* Substate reducers */

const isSolved = state =>
  state.get("filteredSolution") ===
  state
    .get("guessTileIds")
    .reduce(
      (current, next) => current + state.getIn(["tiles", next, "char"], "_"),
      ""
    );
const playNewTileSound = (state, defaultSound) => {
  if (state.get("solved")) {
    playSound(SOUNDS.WIN);
  } else if (state.get("guessTileIds").includes(null)) {
    playSound(defaultSound);
  } else {
    playSound(SOUNDS.ERROR);
  }
};
const currentQuestion = (state, action) => {
  switch (action.type) {
    case TILE_ADD: {
      // Validate action
      const tileUsedKeyPath = ["tiles", action.tileId, "used"];
      if (
        state.getIn(tileUsedKeyPath) ||
        !state.get("guessTileIds").includes(null)
      ) {
        break;
      }

      // Mark tile used
      state = state.setIn(tileUsedKeyPath, true);
      const addIndex = state.get("guessTileIds").indexOf(null);
      state = state.merge({
        guessTileIds: state.get("guessTileIds").set(addIndex, action.tileId),
        selectedTileId: action.tileId,
      });

      // Check whether solved
      state = state.set("solved", isSolved(state));
      state.get("solved") && track("SOLVE_QUESTION");
      playNewTileSound(state, SOUNDS.LETTER);
      break;
    }
    case TILE_REMOVE: {
      // Validate action
      const guessTileIds = state.get("guessTileIds", Immutable.List([]));
      const removeIndex = guessTileIds.findLastIndex(
        id => typeof id === "number" && !state.getIn(["tiles", id, "hinted"])
      );
      if (state.get("solved") || removeIndex === -1) {
        break;
      }

      // Mark tile unused
      const tileUsedKeyPath = ["tiles", guessTileIds.get(removeIndex), "used"];
      state = state.setIn(tileUsedKeyPath, false);
      state = state.set("guessTileIds", guessTileIds.set(removeIndex, null));
      playSound(SOUNDS.ERASE);
      break;
    }
    case TILE_SELECT: {
      // Validate action
      const tileId = action.tileId;
      if (state.get("solved") || tileId === state.get("selectedTileId")) {
        break;
      }

      // Select tile
      state = state.set("selectedTileId", tileId);
      playSound(SOUNDS.BUTTON);
      break;
    }
  }
  return state;
};

/* Root reducer given to Redux.createStore */

const rootCombinedReducer = immutableCombineReducers({
  currentQuestion,
});
const getStateWithAwardedHints = state => {
  if (
    !state.getIn(["currentQuestion", "solved"], false) ||
    state.getIn(["currentQuestion", "hintsAwarded"], false)
  ) {
    return state;
  }
  const hintsToAward = state.getIn(["currentQuestion", "difficulty"]) / 1600;
  state = state.setIn(["currentQuestion", "hintsAwarded"], true);
  return state.set("hints", state.get("hints") + hintsToAward);
};
const rootReducer = (state = Immutable.Map({}), action) => {
  state = rootCombinedReducer(state, action);
  let persistState = false;
  switch (action.type) {
    case HINT_USE: {
      // Validate action
      const hints = state.get("hints", 0);
      if (hints < 1 || state.getIn(["currentQuestion", "solved"], false)) {
        break;
      }

      // Decrement hint
      state = state.set("hints", hints - 1);

      // Randomly select an index in the solution to hint
      let question = state.get("currentQuestion");
      const hintIndexPool = [];
      let guessTileIds = question.get("guessTileIds");
      guessTileIds.toJS().forEach((id, i) => {
        (id === null || !question.getIn(["tiles", id, "hinted"])) &&
          hintIndexPool.push(i);
      });
      const hintIndex =
        hintIndexPool[Math.floor(Math.random() * hintIndexPool.length)];

      // If there's already a tile at the hint index, unuse it
      const displacedTileId = guessTileIds.get(hintIndex);
      if (displacedTileId !== null) {
        question = question.setIn(["tiles", displacedTileId, "used"], false);
      }

      // Choose a tile to put at the hint index, preferring unused tiles
      let hintTileFromBank = true;
      const hintChar = question.get("filteredSolution")[hintIndex];
      const hintCharTiles = question
        .get("tiles")
        .filter(t => t.get("char") === hintChar);
      let hintTile = hintCharTiles.find(t => !t.get("used"));
      if (!hintTile) {
        hintTile = hintCharTiles.find(t => !t.get("hinted"));
        hintTileFromBank = false;
      }
      const hintTileId = hintTile.get("id");

      // If we had to use an already used tile, remove its char from the guess
      if (!hintTileFromBank) {
        const misplacedIndex = guessTileIds.indexOf(hintTileId);
        guessTileIds = guessTileIds.set(misplacedIndex, null);
      }

      // Add hint tile to guess
      question = question.merge({
        guessTileIds: guessTileIds.set(hintIndex, hintTileId),
        tiles: question.get("tiles").mergeIn([hintTileId], {
          hinted: true,
          used: true,
        }),
      });
      track("USE_HINT");

      // Check whether solved
      question = question.set("solved", isSolved(question));
      question.get("solved") && track("SOLVE_QUESTION");
      playNewTileSound(question, SOUNDS.HINT);
      state = getStateWithAwardedHints(state.set("currentQuestion", question));
      persistState = true;

      break;
    }
    case HYDRATE: {
      const hydrateState = action.partial
        ? state.merge(action.state)
        : action.state;
      state = rootReducer(hydrateState, {});
      persistState = true;
      break;
    }
    case TILE_ADD:
    case TILE_REMOVE: {
      state = getStateWithAwardedHints(state);
      persistState = true;
      break;
    }
  }

  // Aggressively save state to disk
  persistState && setItem(LOCALSTORAGE.STATE, state.toJS());

  return state;
};
export default rootReducer;
