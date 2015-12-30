import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/QuestionMetadata.scss';
import {EXIT_TILE_ID, HINT_TILE_ID} from '../constants';

export const QuestionMetadata = createPureComponent({
  render() {
    const {category, difficulty, hints, selectedTileId, solved} = this.props;

    const h = Math.floor(hints);
    const hintsMessage = `You have ${h} ${h === 1 ? 'hint' : 'hints'} left.`;
    let children;
    if (solved) {
      const numQuestions = JSON.parse(window.localStorage.seenQuestions).length;
      children = `Question #${numQuestions} solved! ${hintsMessage}`;
    } else {
      switch (selectedTileId) {
        case EXIT_TILE_ID: {
          children = 'Thanks for playing! Your progress will be saved.';
          break;
        }
        case HINT_TILE_ID: {
          children = h ? `${hintsMessage} Use one?` : 'You have no hints left!';
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
    }
    return (
      <p className={styles['question-metadata']}>{children}</p>
    );
  }
});
