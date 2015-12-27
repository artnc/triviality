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
    return (
      <div
        className={classNames(
          styles.tile,
          {[styles.selected]: tileId === selectedTileId},
          {[styles.used]: tile.get('used')}
        )}
        onClick={() => {
          onTileClick(tileId);
        }}
      >{tile.get('letter')}</div>
    );
  }
});
