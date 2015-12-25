import React from 'react';
import {createPureComponent} from '../util/react';
import styles from './Bank.scss';
import {Tile} from './Tile';

export const Bank = createPureComponent({
  render() {
    const {
      cols,
      onTileClick,
      rows,
      tiles
    } = this.props;

    // Construct cell grid using tiles' x and y coordinates
    const grid = Array(rows).fill().map(() => Array(cols));
    tiles.forEach((tile, i) => {
      grid[Math.floor(i / cols)][i % cols] = (
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
