import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/Guess.scss';
import {Tile} from '../components/Tile';

// Arbitrary constant unlikely to ever appear naturally
const RUN_DELIMITER = '@#"';

const WHITESPACE = '\u00a0\u00a0';

export const Guess = createPureComponent({
  render() {
    const {guess, solution} = this.props;
    const delimitedSolution = solution.trim().replace(
      /\s+/g,
      `${RUN_DELIMITER}${WHITESPACE}${RUN_DELIMITER}`
    );

    let slotGroupPosition = 0;
    return (
      <div className={styles.guess}>
        {delimitedSolution.split(RUN_DELIMITER).map((run) => {
          if (!(run.length && run.charAt(0).match(/\w/))) {
            return run;
          }

          const slotGroup = [];
          for (let i = 0; i < run.length; ++i) {
            slotGroup.push(
              <Tile tile={({
                id: -1,
                letter: guess[slotGroupPosition + i] || '\u00a0'
              })} />
            );
          }

          slotGroupPosition += run.length;
          return slotGroup;
        })}
      </div>
    );
  }
});
