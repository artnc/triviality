import classNames from 'classnames';
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
        className={classNames(
          styles.tile,
          {[styles.used]: tile.get('used')}
        )}
        onClick={() => {
          onTileClick(tile.get('id'));
        }}
      >{tile.get('letter')}</div>
    );
  }
});
