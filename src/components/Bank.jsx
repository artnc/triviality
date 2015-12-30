import classNames from 'classnames';
import React from 'react';
import {
  BANK_EXTRAS_ROW,
  EXIT_TILE_ID,
  HINT_TILE_ID,
  GRID_HEIGHT,
  GRID_WIDTH,
  SIDE_PADDING
} from '../constants';
import {createPureComponent} from '../util/react';
import styles from './Bank.scss';
import {Tile} from './Tile';

export const Bank = createPureComponent({
  render() {
    const {
      hints,
      onExitClick,
      onHintClick,
      onTileClick,
      selectedTileId,
      solved,
      tiles
    } = this.props;

    // Construct cell grid using tiles' x and y coordinates
    const paddedWidth = GRID_WIDTH + SIDE_PADDING * 2;
    const grid = Array(GRID_HEIGHT).fill().map(() => Array(paddedWidth));
    let x, y;
    tiles && tiles.forEach((tile, i) => {
      x = i % GRID_WIDTH + SIDE_PADDING;
      y = Math.floor(i / GRID_WIDTH);
      grid[y][x] = (
        <td key={y * paddedWidth + x}>
          <Tile
            onTileClick={onTileClick}
            selectedTileId={selectedTileId}
            tile={tile.toJS()}
          />
        </td>
      );
    });

    // Add special tiles (exit, hint)
    let start, end;
    for (let i = 0; i < GRID_HEIGHT; ++i) {
      for (let j = 0; j < SIDE_PADDING; ++j) {
        start = null;
        if (i === BANK_EXTRAS_ROW && j === 0) {
          start = <Tile
            hoverText = 'Quit'
            onTileClick={onExitClick}
            selectedTileId={selectedTileId}
            tile={({
              char: '\u00d7',
              id: EXIT_TILE_ID,
              used: false
            })}
          />;
        }
        grid[i][j] = <td key={i * paddedWidth + j}>{start}</td>;
      }
      for (let j = GRID_WIDTH + SIDE_PADDING; j < paddedWidth; ++j) {
        end = null;
        if (i === BANK_EXTRAS_ROW && j === paddedWidth - 1) {
          end = <Tile
            hoverText = 'Use a hint'
            onTileClick={onHintClick}
            selectedTileId={selectedTileId}
            tile={({
              char: '?',
              id: HINT_TILE_ID,
              used: !(hints && Math.floor(hints))
            })}
          />;
        }
        grid[i][j] = <td key={i * paddedWidth + j}>{end}</td>;
      }
    }

    return (
      <table className={classNames(
        styles.table,
        {[styles.solved]: solved}
      )}>
        <tbody>
          {grid.map((row, i) => <tr key={i}>{row}</tr>)}
        </tbody>
      </table>
    );
  }
});
