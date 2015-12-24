import {TILE_ADD} from './actions';

const INITIAL_STATE = {
  prompt: 'hello',
  solution: 'world',
  tiles: [
    {
      id: 0,
      letter: 'A',
      used: false
    },
    {
      id: 1,
      letter: 'B',
      used: false
    },
    {
      id: 2,
      letter: 'C',
      used: false
    }
  ]
};

export default function app(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TILE_ADD:
      const used = state.tiles[action.tileId].used;
      state.tiles[action.tileId].used = !used;
      console.log(state.tiles[action.tileId]);
      return state;
    default:
      return state;
  }
}
