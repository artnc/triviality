import classNames from "classnames";

import { TileUI } from "./TileUI";
import {
  BANK_EXTRAS_ROW,
  EXIT_TILE_ID,
  GRID_HEIGHT,
  GRID_WIDTH,
  HINT_TILE_ID,
  SIDE_PADDING,
} from "../constants";
import { Tile } from "../reducers";
import * as styles from "./Bank.module.scss";

export const Bank = ({
  hints,
  onExitClick,
  onHintClick,
  onTileClick,
  selectedTileId,
  solved,
  tiles,
}: {
  hints: number;
  onExitClick: () => void;
  onHintClick: () => void;
  onTileClick: (tile: Tile) => void;
  selectedTileId: number;
  solved: boolean;
  tiles: Tile[];
}) => {
  // Construct cell grid using tiles' x and y coordinates
  const paddedWidth = GRID_WIDTH + SIDE_PADDING * 2;
  const grid = Array(GRID_HEIGHT)
    .fill(0)
    .map(() => Array(paddedWidth));
  let x;
  let y;
  tiles &&
    tiles.forEach((tile, i) => {
      x = (i % GRID_WIDTH) + SIDE_PADDING;
      y = Math.floor(i / GRID_WIDTH);
      grid[y][x] = (
        <td key={y * paddedWidth + x}>
          <TileUI
            onTileClick={onTileClick}
            selectedTileId={selectedTileId}
            tile={tile}
          />
        </td>
      );
    });

  // Add special tiles (exit, hint)
  let end;
  let start;
  for (let i = 0; i < GRID_HEIGHT; ++i) {
    for (let j = 0; j < SIDE_PADDING; ++j) {
      start = null;
      if (i === BANK_EXTRAS_ROW && j === 0) {
        start = (
          <TileUI
            hoverText="Quit"
            onTileClick={onExitClick}
            selectedTileId={selectedTileId}
            tile={{ char: "\u00d7", id: EXIT_TILE_ID, used: false }}
          />
        );
      }
      grid[i][j] = <td key={i * paddedWidth + j}>{start}</td>;
    }
    for (let j = GRID_WIDTH + SIDE_PADDING; j < paddedWidth; ++j) {
      end = null;
      if (i === BANK_EXTRAS_ROW && j === paddedWidth - 1) {
        end = (
          <TileUI
            hoverText="Use a hint"
            onTileClick={onHintClick}
            selectedTileId={selectedTileId}
            tile={{
              char: "?",
              id: HINT_TILE_ID,
              used: !(hints && Math.floor(hints)),
            }}
          />
        );
      }
      grid[i][j] = <td key={i * paddedWidth + j}>{end}</td>;
    }
  }

  return (
    <table className={classNames(styles.table, { [styles.solved]: solved })}>
      <tbody>
        {grid.map((row, i) => (
          <tr key={i}>{row}</tr>
        ))}
      </tbody>
    </table>
  );
};
