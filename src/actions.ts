import { Action } from "redux";

import { GRID_HEIGHT, GRID_WIDTH } from "./constants";
import { Question, State } from "./reducers";
import { getQuestion } from "./util/api";
import { LOCALSTORAGE, getItem } from "./util/storage";
import { track } from "./util/tracking";

export type ActionObject =
  | {
      type: "HINT_USE";
    }
  | {
      partial: boolean;
      state: State;
      type: "HYDRATE";
    }
  | {
      tileId: number;
      type: "TILE_ADD";
    }
  | {
      type: "TILE_REMOVE";
    }
  | {
      tileId: number;
      type: "TILE_SELECT";
    };

type GetState = () => State;

export interface Dispatch {
  /** Synchronously dispatch a Redux action object */
  <T extends ActionObject>(action: T): T;
  /** Dispatch a (usually async) Redux action function and return its result */
  <T>(action: (dispatch: Dispatch, getState: GetState) => T): T;
}

/* Action creators */

export const useHint = (): ActionObject => ({ type: "HINT_USE" });

const hydrate = (hydrateState: State, partial = false): ActionObject => ({
  partial,
  state: hydrateState,
  type: "HYDRATE",
});

export const hydrateNewQuestion =
  (initForNewUser: boolean) => (dispatch: Dispatch, getState: GetState) => {
    const delay = initForNewUser ? 0 : 3000;
    const bankSize = GRID_HEIGHT * GRID_WIDTH;
    const { seenQuestions = [] } = getState();
    let waiting = !!delay;
    let currentQuestion: Question | undefined;
    const dispatchHydrate = () => {
      seenQuestions.push(currentQuestion!.id);
      let hydrateState = getState();
      if (initForNewUser) {
        hydrateState = { hints: 20, seenQuestions: [] };
      }
      hydrateState = { ...hydrateState, currentQuestion, seenQuestions };
      track("GET_QUESTION");
      return dispatch(hydrate(hydrateState, true));
    };
    (async () => {
      const question = await getQuestion(bankSize, seenQuestions);
      currentQuestion = question;
      !waiting && dispatchHydrate();
    })();
    delay &&
      window.setTimeout(() => {
        if (currentQuestion) {
          dispatchHydrate();
        } else {
          waiting = false;
        }
      }, delay);
  };
export const initState = () => {
  const savedState = getItem(LOCALSTORAGE.STATE);
  return savedState ? hydrate(savedState) : hydrateNewQuestion(true);
};

export const addTile = (tileId: number): ActionObject => ({
  tileId,
  type: "TILE_ADD",
});
export const removeTile = (): ActionObject => ({ type: "TILE_REMOVE" });
export const selectTile = (tileId: number): ActionObject => ({
  tileId,
  type: "TILE_SELECT",
});
