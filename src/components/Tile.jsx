import classNames from 'classnames';
import React from 'react';
import {createPureComponent} from '../util/react';
import styles from './Tile.scss';

export const Tile = createPureComponent({
  render() {
    const {
      onTileClick,
      selectedTileId,
      tile
    } = this.props;

    return (
      <div
        className={classNames(
          styles.tile,
          {
            [styles.selected]: tile.id === selectedTileId,
            [styles.used]: tile.used
          }
        )}
        onClick={() => {
          onTileClick(tile);
        }}
      >
        <span>{tile.letter}</span>
      </div>
    );
  }
});
