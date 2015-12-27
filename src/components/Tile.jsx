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

    const tileId = tile.get('id');
    const tileUsed = tile.get('used');
    return (
      <div
        className={classNames(
          styles.tile,
          {[styles.selected]: tileId === selectedTileId},
          {[styles.used]: tileUsed}
        )}
        onClick={() => {
          onTileClick(tile.toJS());
        }}
      >{tile.get('letter')}</div>
    );
  }
});
