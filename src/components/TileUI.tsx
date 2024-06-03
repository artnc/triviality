import classNames from "classnames";

import { Tile } from "../reducers";
import * as styles from "./TileUI.module.scss";

export const TileUI = ({
  hoverText,
  onTileClick,
  selectedTileId,
  tile,
}: {
  hoverText?: string;
  onTileClick: (tile: Tile) => void;
  selectedTileId: number;
  tile: any;
}) => (
  <div
    className={classNames(styles.tile, {
      [styles.selected]: tile.id === selectedTileId,
      [styles.used]: tile.used,
    })}
    title={hoverText}
    onClick={() => {
      onTileClick(tile);
    }}
  >
    <span>{tile.char}</span>
  </div>
);
