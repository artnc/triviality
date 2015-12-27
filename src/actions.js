import Immutable from 'immutable';

// Action types

export const HISTORY_STATE_POP = 'HISTORY_STATE_POP';
export const HISTORY_STATE_PUSH = 'HISTORY_STATE_PUSH';
export const HYDRATE = 'HYDRATE';
export const TILE_ADD = 'TILE_ADD';
export const TILE_SELECT = 'TILE_SELECT';

// Action utils

// Converts the server's challenge format into a complete Redux state
export const initializeChallengeState = (challengeJson) => {
  const store = Object.assign({
    guess: '',
    selectedTileId: 0
  }, challengeJson);
  const used = false;
  store.tiles = challengeJson.tileString.split('').map((letter, id) => {
    return {id, letter, used};
  });
  return Immutable.fromJS(store);
};

// Action creators

export const popHistoryState = () => ({type: HISTORY_STATE_POP});

export const pushHistoryState = () => ({type: HISTORY_STATE_PUSH});

export const hydrate = (hydrateState) => ({
  state: hydrateState,
  type: HYDRATE
});

export const addTile = (tileId, letter) => ({
  letter,
  type: TILE_ADD,
  tileId
});

export const selectTile = (tileId) => ({
  type: TILE_SELECT,
  tileId
});
