import React from 'react';

import styles from 'components/Prompt.scss';
import {createPureComponent} from 'util/react';

export const Prompt = createPureComponent({
  render() {
    const {children} = this.props;
    return <p className={styles.prompt}>{children}</p>;
  }
});
