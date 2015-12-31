import classNames from 'classnames';
import React from 'react';

import styles from 'components/Guess.scss';
import {Slot} from 'components/Slot';
import {createPureComponent} from 'util/react';

export const Guess = createPureComponent({
  render() {
    const {
      guess,
      guessTileIds,
      onPromptClick,
      solutionRuns,
      solved
    } = this.props;

    let slotGroupPosition = 0;
    return (
      <div
        className={classNames(
          styles.guess,
          {
            [styles.populated]: guessTileIds && guessTileIds.some(id => (
              typeof id === 'number'
            )),
            [styles.solved]: solved
          }
        )}
        onClick={onPromptClick}
      >
        {solutionRuns && solutionRuns.map(run => {
          if (typeof run === 'string') {
            return run;
          }

          const slotGroup = [];
          let guessIndex;
          for (let i = 0; i < run; ++i) {
            guessIndex = slotGroupPosition + i;
            slotGroup.push(
              <Slot
                solved={solved ||
                  typeof guessTileIds.get(guessIndex) === 'string'}
              >{guess.get(guessIndex) || '\u00a0'}</Slot>
            );
          }

          slotGroupPosition += run;
          return slotGroup;
        })}
      </div>
    );
  }
});
