import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/QuestionMetadata.scss';

export const QuestionMetadata = createPureComponent({
  render() {
    const {category, difficulty} = this.props;
    return (
      <p className={styles['question-metadata']}>
        <span className={styles.bold}>{category}</span>
        <span className={styles.for}>
          &nbsp;&nbsp;{category && 'for'}&nbsp;&nbsp;
        </span>
        <span className={styles.bold}>{difficulty && `$${difficulty}`}</span>
      </p>
    );
  }
});
