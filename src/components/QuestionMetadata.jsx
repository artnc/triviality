import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/QuestionMetadata.scss';
import {EXIT_TILE_ID, HINT_TILE_ID} from '../constants';

export const QuestionMetadata = createPureComponent({
  render() {
    const {
      category,
      difficulty,
      hints,
      seenQuestions,
      selectedTileId,
      solved
    } = this.props;

    const h = Math.floor(hints);
    const hintsMessage = `You have ${h} ${h === 1 ? 'hint' : 'hints'} left.`;
    let children;
    if (solved) {
      children = `Question #${seenQuestions.size} solved! ${hintsMessage}`;
    } else {
      switch (selectedTileId) {
        case EXIT_TILE_ID: {
          children = 'Thanks for playing! ' +
            `Question #${seenQuestions.size} will be saved.`;
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
              &nbsp;&nbsp;for&nbsp;&nbsp;
            </span>,
            <span key={2} className={styles.bold}>${difficulty}</span>
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
