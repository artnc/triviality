import React from 'react';
import {createPureComponent} from '../util/react';
import styles from '../components/Guess.scss';
import {Slot} from '../components/Slot';

// Arbitrary constant unlikely to ever appear naturally
const RUN_DELIMITER = '@#"';

const NBSP = '\u00a0';

export const Guess = createPureComponent({
  render() {
    const {guess, solution} = this.props;
    const delimitedSolution = solution.trim().replace(
      /(\w+)/g,
      `${RUN_DELIMITER}$1${RUN_DELIMITER}`
    );

    let slotGroupPosition = 0;
    return (
      <div className={styles.guess}>
        {delimitedSolution.split(RUN_DELIMITER).map((run) => {
          if (run === ' ') {
            return NBSP;
          } else if (!(run.length && run.charAt(0).match(/\w/))) {
            return run;
          }

          const slotGroup = [];
          for (let i = 0; i < run.length; ++i) {
            slotGroup.push(
              <Slot>{guess[slotGroupPosition + i] || '\u00a0'}</Slot>
            );
          }

          slotGroupPosition += run.length;
          return slotGroup;
        })}
      </div>
    );
  }
});
