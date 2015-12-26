import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/Prompt.scss';

export const Prompt = createPureComponent({
  render() {
    const {children} = this.props;
    return <p className={styles.prompt}>{children}</p>;
  }
});
