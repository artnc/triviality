import classNames from "classnames";

import { Tile } from "../reducers";
import { Slot } from "./Slot";
import * as styles from "./Guess.module.scss";

export const Guess = ({
  guessTileIds,
  onPromptClick,
  solutionRuns,
  solved,
  tiles,
}: {
  guessTileIds: (null | number)[];
  onPromptClick: () => void;
  solutionRuns: (string | number)[];
  solved: boolean;
  tiles: Tile[];
}) => {
  let slotGroupPosition = 0;
  return (
    <div
      className={classNames(styles.guess, {
        [styles.populated]:
          guessTileIds && guessTileIds.some(id => id !== null),
        [styles.solved]: solved,
      })}
      onClick={onPromptClick}
    >
      {solutionRuns &&
        solutionRuns.map(run => {
          if (typeof run === "string") {
            return run;
          }

          const slotGroup = [];
          let tileId;
          for (let i = 0; i < run; ++i) {
            tileId = guessTileIds[slotGroupPosition + i];
            slotGroup.push(
              <Slot key={i} solved={solved || !!tiles[tileId!]?.hinted}>
                {tiles[tileId!]?.char ?? "\u00a0"}
              </Slot>,
            );
          }

          slotGroupPosition += run;
          return slotGroup;
        })}
    </div>
  );
};
