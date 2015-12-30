import classNames from 'classnames';
import React from 'react';
import {BANK_EXTRAS_ROW, GRID_HEIGHT, GRID_WIDTH} from '../constants';
import {createPureComponent} from '../util/react';
import styles from './Bank.scss';
import {Tile} from './Tile';

// Number of extra columns added to both left and right sides of bank
const SIDE_PADDING = 2;

export const Bank = createPureComponent({
  render() {
    const {
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
            onTileClick={onExitClick}
            selectedTileId={selectedTileId}
            tile={({
              char: '\u00ab',
              id: 'EXIT',
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
            onTileClick={onHintClick}
            selectedTileId={selectedTileId}
            tile={({
              char: '?',
              id: 'HINT',
              used: false
            })}
          />;
        }
        grid[i][j] = <td key={i * paddedWidth + j}>{end}</td>;
      }
    }
    console.log(grid);

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
