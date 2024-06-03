import { ActionObject } from "./actions";
import { SOUNDS, playSound } from "./util/audio";
import { LOCALSTORAGE, setItem } from "./util/storage";
import { track } from "./util/tracking";

export interface Tile {
  char: string;
  hinted?: true;
  id: number;
  used: boolean;
}
export interface Question {
  category: string;
  difficulty: number;
  filteredSolution: string;
  guessTileIds: (null | number)[];
  hintsAwarded?: true;
  id: number;
  prompt: string;
  selectedTileId: any;
  solutionRuns: (number | " ")[];
  solved: boolean;
  tileString: string;
  tiles: Tile[];
}
export interface State {
  currentQuestion?: Question;
  hints: number;
  seenQuestions: number[];
}

/* Reducer utils */

const copy = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;
const isSolved = (state: State["currentQuestion"]) =>
  !!state &&
  state.filteredSolution ===
    state.guessTileIds
      .map(tileId => state.tiles[tileId!]?.char ?? "_")
      .join("");
const playNewTileSound = (
  state: NonNullable<State["currentQuestion"]>,
  defaultSound: HTMLAudioElement,
) =>
  playSound(
    state.solved
      ? SOUNDS.WIN
      : state.guessTileIds.includes(null)
      ? defaultSound
      : SOUNDS.ERROR,
  );
const currentQuestion = (
  state: NonNullable<State["currentQuestion"]>,
  action: ActionObject,
) => {
  state = copy(state);
  switch (action.type) {
    case "TILE_ADD": {
      // Validate action
      const tile = state.tiles[action.tileId];
      if (tile.used || !state.guessTileIds.includes(null)) {
        break;
      }

      // Mark tile used
      tile.used = true;
      const addIndex = state.guessTileIds.indexOf(null);
      state.guessTileIds[addIndex] = action.tileId;
      state.selectedTileId = action.tileId;

      // Check whether solved
      state.solved = isSolved(state);
      state.solved && track("SOLVE_QUESTION");
      playNewTileSound(state, SOUNDS.LETTER);
      break;
    }
    case "TILE_REMOVE": {
      // Validate action
      const guessTileIds = state.guessTileIds;
      const removeIndex = guessTileIds.findLastIndex(
        id => typeof id === "number" && !state.tiles[id].hinted,
      );
      if (state.solved || removeIndex === -1) {
        break;
      }

      // Mark tile unused
      state.tiles[guessTileIds[removeIndex]!].used = false;
      guessTileIds[removeIndex] = null;
      state.guessTileIds = guessTileIds;
      playSound(SOUNDS.ERASE);
      break;
    }
    case "TILE_SELECT": {
      // Validate action
      const tileId = action.tileId;
      if (state.solved || tileId === state.selectedTileId) {
        break;
      }

      // Select tile
      state.selectedTileId = tileId;
      playSound(SOUNDS.BUTTON);
      break;
    }
  }
  return state;
};

/* Root reducer given to Redux.createStore */

const getStateWithAwardedHints = (state: State) => {
  if (!state.currentQuestion?.solved || state.currentQuestion.hintsAwarded) {
    return state;
  }
  const hintsToAward = state.currentQuestion.difficulty / 1600;
  state.currentQuestion.hintsAwarded = true;
  return { ...state, hints: state.hints + hintsToAward };
};
const rootReducer = (
  state: State = {
    hints: 20,
    seenQuestions: [],
  },
  action: ActionObject,
) => {
  state = copy(state);
  if (state.currentQuestion) {
    state.currentQuestion = currentQuestion(state.currentQuestion, action);
  }
  let persistState = false;
  switch (action.type) {
    case "HINT_USE": {
      // Validate action
      let question = state.currentQuestion;
      const hints = state.hints;
      if (hints < 1 || !question || question.solved) {
        break;
      }

      // Decrement hint
      state.hints -= 1;

      // Randomly select an index in the solution to hint
      const hintIndexPool: number[] = [];
      let guessTileIds = question.guessTileIds;
      guessTileIds.forEach((id, i) => {
        (id === null || !question.tiles[id].hinted) && hintIndexPool.push(i);
      });
      const hintIndex =
        hintIndexPool[Math.floor(Math.random() * hintIndexPool.length)];

      // If there's already a tile at the hint index, unuse it
      const displacedTileId = guessTileIds[hintIndex];
      if (displacedTileId !== null) {
        question.tiles[displacedTileId].used = false;
      }

      // Choose a tile to put at the hint index, preferring unused tiles
      let hintTileFromBank = true;
      const hintChar = question.filteredSolution[hintIndex];
      const hintCharTiles = question.tiles.filter(t => t.char === hintChar);
      let hintTile = hintCharTiles.find(t => !t.used);
      if (!hintTile) {
        hintTile = hintCharTiles.find(t => !t.hinted);
        hintTileFromBank = false;
      }
      const hintTileId = hintTile!.id;

      // If we had to use an already used tile, remove its char from the guess
      if (!hintTileFromBank) {
        const misplacedIndex = guessTileIds.indexOf(hintTileId);
        guessTileIds[misplacedIndex] = null;
      }

      // Add hint tile to guess
      question.guessTileIds[hintIndex] = hintTileId;
      question.tiles[hintTileId].hinted = true;
      question.tiles[hintTileId].used = true;
      track("USE_HINT");

      // Check whether solved
      question.solved = isSolved(question);
      question.solved && track("SOLVE_QUESTION");
      playNewTileSound(question, SOUNDS.HINT);
      state = getStateWithAwardedHints({ ...state, currentQuestion: question });
      persistState = true;
      break;
    }
    case "HYDRATE": {
      const hydrateState = action.partial
        ? { ...state, ...action.state }
        : action.state;
      state = hydrateState as State;
      persistState = true;
      break;
    }
    case "TILE_ADD":
    case "TILE_REMOVE": {
      state = getStateWithAwardedHints(state);
      persistState = true;
      break;
    }
  }

  // Aggressively save state to disk
  persistState && setItem(LOCALSTORAGE.STATE, state);

  return state;
};
export default rootReducer;
