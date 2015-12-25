import Immutable from 'immutable';

// Action types

export const TILE_ADD = 'TILE_ADD';

// Action utils

// Converts the server's challenge format into a complete Redux state
export const convertApiChallengeToState = (challenge) => {
  const store = Object.assign({}, challenge);
  const used = false;
  store.tiles = challenge.tiles.split('').map((letter, id) => {
    return {id, letter, used};
  });
  return Immutable.fromJS(store);
};

// Action creators

export const addTile = (tileId) => {
  return {
    type: TILE_ADD,
    tileId
  };
};
