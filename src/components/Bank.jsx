import classNames from 'classnames';
import React from 'react';
import styles from './Bank.scss';

export const Bank = React.createClass({
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
        <td
          key={tile.get('id')}
          onClick={() => {
            onTileClick(tile.get('id'));
          }}
        >{tile.get('letter')}</td>
      );
    });

    return (
      <table className={classNames(styles.table)}>
        <tbody>
          {grid.map((row, i) => <tr key={i}>{row}</tr>)}
        </tbody>
      </table>
    );
  }
});
