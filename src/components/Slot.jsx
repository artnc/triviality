import React from 'react';
import {createPureComponent} from '../util/react';
import styles from './Slot.scss';

export const Slot = createPureComponent({
  render() {
    const {children} = this.props;

    return <div className={styles.slot}>{children}</div>;
  }
});
