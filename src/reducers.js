import Immutable from 'immutable';

import {
  HINT_USE,
  HYDRATE,
  TILE_ADD,
  TILE_REMOVE,
  TILE_SELECT
} from 'actions';
import {SOUNDS, playSound} from 'util/audio';

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

const isSolved = (state) => (
  state.get('guess').join('') === state.get('filteredSolution')
);
const playNewTileSound = (state, defaultSound) => {
  if (state.get('solved')) {
    playSound(SOUNDS.WIN);
  } else if (state.get('guess').includes(null)) {
    playSound(defaultSound);
  } else {
    playSound(SOUNDS.ERROR);
  }
};
const currentQuestion = (state, action) => {
  switch (action.type) {
    case TILE_ADD: {
      // Validate action
      const tileUsedKeyPath = ['tiles', action.tileId, 'used'];
      if (state.getIn(tileUsedKeyPath) || !state.get('guess').includes(null)) {
        break;
      }

      // Mark tile used
      state = state.setIn(tileUsedKeyPath, true);
      const addIndex = state.get('guess').indexOf(null);
      const tileChar = state.getIn(['tiles', action.tileId, 'char']);
      const guess = state.get('guess').set(addIndex, tileChar);
      state = state.merge({
        guess,
        guessTileIds: state.get('guessTileIds').set(addIndex, action.tileId),
        selectedTileId: action.tileId
      });

      // Check whether solved
      state = state.set('solved', isSolved(state));
      playNewTileSound(state, SOUNDS.LETTER);
      break;
    }
    case TILE_REMOVE: {
      // Validate action
      const guessTileIds = state.get('guessTileIds', Immutable.List([]));
      const removeIndex = guessTileIds.findLastIndex(id => (
        typeof id === 'number'
      ));
      if (state.get('solved') || removeIndex === -1) {
        break;
      }

      // Mark tile unused
      const tileUsedKeyPath = ['tiles', guessTileIds.get(removeIndex), 'used'];
      state = state.setIn(tileUsedKeyPath, false);
      state = state.merge({
        guess: state.get('guess').set(removeIndex, null),
        guessTileIds: guessTileIds.set(removeIndex, null)
      });
      playSound(SOUNDS.ERASE);
      break;
    }
    case TILE_SELECT: {
      // Validate action
      const tileId = action.tileId;
      if (state.get('solved') || tileId === state.get('selectedTileId')) {
        break;
      }

      // Select tile
      state = state.set('selectedTileId', tileId);
      playSound(SOUNDS.BUTTON);
      break;
    }
  }
  return state;
};

/* Root reducer given to Redux.createStore */

const rootCombinedReducer = immutableCombineReducers({
  currentQuestion
});
const getStateWithAwardedHints = state => {
  if (!state.getIn(['currentQuestion', 'solved'], false) ||
    state.getIn(['currentQuestion', 'hintsAwarded'], false)) {
    return state;
  }
  const hintsToAward = state.getIn(['currentQuestion', 'difficulty']) / 1600;
  state = state.setIn(['currentQuestion', 'hintsAwarded'], true);
  return state.set('hints', state.get('hints') + hintsToAward);
};
const rootReducer = (state = Immutable.Map({}), action) => {
  state = rootCombinedReducer(state, action);
  let persistState = false;
  switch (action.type) {
    case HINT_USE: {
      // Validate action
      const hints = state.get('hints', 0);
      if (hints < 1 || state.getIn(['currentQuestion', 'solved'], false)) {
        break;
      }

      // Decrement hint
      state = state.set('hints', hints - 1);

      // Randomly select an index in the solution to hint
      let question = state.get('currentQuestion');
      const hintIndexPool = [];
      let guessTileIds = question.get('guessTileIds');
      guessTileIds.toJS().forEach((id, i) => {
        (typeof id !== 'string') && hintIndexPool.push(i);
      });
      const hintIndex = hintIndexPool[Math.floor(Math.random() *
        hintIndexPool.length)];
      const hintChar = question.get('filteredSolution')[hintIndex];

      // If there's already a tile at the hint index, unuse it
      const displacedTileId = guessTileIds.get(hintIndex);
      if (typeof displacedTileId === 'number') {
        question = question.setIn(['tiles', displacedTileId, 'used'], false);
      }

      // Choose a tile to put at the hint index, preferring unused tiles
      let hintTileFromBank = true;
      let hintTile = question.get('tiles').find(t => (
        t.get('char') === hintChar && !t.get('used')
      ));
      if (!hintTile) {
        hintTile = question.get('tiles').find(t => (
          t.get('char') === hintChar && !guessTileIds.includes(`${t.get('id')}`)
        ));
        hintTileFromBank = false;
      }
      const hintTileId = hintTile.get('id');

      // If we had to use an already used tile, remove its char from the guess
      if (!hintTileFromBank) {
        const misplacedIndex = guessTileIds.indexOf(hintTileId);
        question = question.setIn(['guess', misplacedIndex], null);
        guessTileIds = guessTileIds.set(misplacedIndex, null);
      }

      // Add hint tile to guess
      question = question.merge({
        guess: question.get('guess').set(hintIndex, hintChar),
        guessTileIds: guessTileIds.set(hintIndex, `${hintTileId}`),
        tiles: question.get('tiles').mergeIn([hintTileId], {
          solved: true,
          used: true
        })
      });

      // Sanity checks (since there are no unit tests...)
      if (__DEV__) {
        for (let i = 0; i < question.get('guess').size; ++i) {
          const tileId = question.getIn(['guessTileIds', i]);
          const guessChar = question.getIn(['guess', i]);
          switch (typeof tileId) {
            case 'number': {
              if (question.getIn(['tiles', tileId, 'char']) !== guessChar) {
                console.error('Guess char doesn\'t match reference char');
              }
              break;
            }
            case 'object': {
              guessChar !== null && console.error('Guess contains feral char');
              break;
            }
            case 'string': {
              if (question.getIn(
                ['tiles', parseInt(tileId), 'char']) !== guessChar) {
                console.error('Guess char doesn\'t match hint char');
              }
              break;
            }
            default: {
              console.error('Guess reference of wrong type');
              break;
            }
          }
        }
      }

      // Check whether solved
      question = question.set('solved', isSolved(question));
      playNewTileSound(question, SOUNDS.HINT);
      state = getStateWithAwardedHints(state.set('currentQuestion', question));
      persistState = true;

      break;
    }
    case HYDRATE: {
      const hydrateState = action.partial ? state.merge(action.state) :
        action.state;
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
  if (persistState) {
    window.localStorage.state = JSON.stringify(state.toJS());
  }

  return state;
};
export default rootReducer;
