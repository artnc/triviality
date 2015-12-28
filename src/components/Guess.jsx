import React from 'react';
import styles from '../components/Guess.scss';
import {Slot} from '../components/Slot';
import {createPureComponent} from '../util/react';

export const Guess = createPureComponent({
  render() {
    const {guess, solutionRuns} = this.props;

    let slotGroupPosition = 0;
    return (
      <div className={styles.guess}>
        {solutionRuns.map((run) => {
          if (typeof run === 'string') {
            return run;
          }

          const slotGroup = [];
          for (let i = 0; i < run; ++i) {
            slotGroup.push(
              <Slot>{guess[slotGroupPosition + i] || '\u00a0'}</Slot>
            );
          }

          slotGroupPosition += run;
          return slotGroup;
        })}
      </div>
    );
  }
});
