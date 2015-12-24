// Action types

export const TILE_ADD = 'TILE_ADD';

// Action creators

export function addTile(tileId) {
  return {
    type: TILE_ADD,
    tileId
  };
}
