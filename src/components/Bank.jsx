import React from 'react';
import {GRID_HEIGHT, GRID_WIDTH} from '../constants';
import {createPureComponent} from '../util/react';
import styles from './Bank.scss';
import {Tile} from './Tile';

export const Bank = createPureComponent({
  render() {
    const {
      onTileClick,
      tiles
    } = this.props;

    // Construct cell grid using tiles' x and y coordinates
    const grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH));
    tiles.forEach((tile, i) => {
      grid[Math.floor(i / GRID_WIDTH)][i % GRID_WIDTH] = (
        <td key={tile.get('id')}>
          <Tile
            onTileClick={onTileClick}
            tile={tile}
          />
        </td>
      );
    });

    return (
      <table className={styles.table}>
        <tbody>
          {grid.map((row, i) => <tr key={i}>{row}</tr>)}
        </tbody>
      </table>
    );
  }
});
