import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/QuestionMetadata.scss';

export const QuestionMetadata = createPureComponent({
  render() {
    const {category, difficulty, hints, selectedTileId} = this.props;

    let children;
    switch (selectedTileId) {
      case 'EXIT': {
        children = 'Thanks for playing! Your progress will be saved.';
        break;
      }
      case 'HINT': {
        children = hints ?
          `You have ${hints} ${hints === 1 ? 'hint' : 'hints'} left. Use one?` :
          'You have no hints left!';
        break;
      }
      default: {
        children = [
          <span key={0} className={styles.bold}>{category}</span>,
          <span key={1} className={styles.for}>
            &nbsp;&nbsp;{category && 'for'}&nbsp;&nbsp;
          </span>,
          <span key={2} className={styles.bold}>
            {difficulty && `$${difficulty}`}
          </span>
        ];
        break;
      }
    }
    return (
      <p className={styles['question-metadata']}>{children}</p>
    );
  }
});
