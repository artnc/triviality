import classNames from 'classnames';
import React from 'react';
import {createPureComponent} from '../util/react';
import styles from './Slot.scss';

export const Slot = createPureComponent({
  render() {
    const {children, solved} = this.props;

    return (
      <div
        className={classNames(
          styles.slot,
          {[styles.solved]: solved}
        )}
      >{children}</div>
    );
  }
});
