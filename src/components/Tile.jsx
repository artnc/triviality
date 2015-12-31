import classNames from 'classnames';
import React from 'react';

import {createPureComponent} from 'util/react';
import styles from 'components/Tile.scss';

export const Tile = createPureComponent({
  render() {
    const {
      hoverText,
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
        title={hoverText}
        onClick={() => {
          onTileClick(tile);
        }}
      >
        <span>{tile.char}</span>
      </div>
    );
  }
});
