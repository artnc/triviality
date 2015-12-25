import React from 'react';
import {createPureComponent} from '../util/react';
import styles from './Tile.scss';

export const Tile = createPureComponent({
  render() {
    const {
      onTileClick,
      tile
    } = this.props;

    return (
      <div
        className={styles.tile}
        onClick={() => {
          onTileClick(tile.get('id'));
        }}
      >{tile.get('letter')}</div>
    );
  }
});
