import classNames from 'classnames';
import React from 'react';

import {Slot} from 'components/Slot';
import styles from 'styles/Guess.scss';
import {createPureComponent} from 'util/react';

export const Guess = createPureComponent({
  render() {
    const {
      guessTileIds,
      onPromptClick,
      solutionRuns,
      solved,
      tiles
    } = this.props;

    let slotGroupPosition = 0;
    return (
      <div
        className={classNames(
          styles.guess,
          {
            [styles.populated]: guessTileIds && guessTileIds.some((id) => (
              id !== null
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
          let tileId;
          for (let i = 0; i < run; ++i) {
            tileId = guessTileIds.get(slotGroupPosition + i);
            slotGroup.push(
              <Slot
                solved={solved || tiles.getIn([tileId, 'hinted'])}
              >{tiles.getIn([tileId, 'char'], '\u00a0')}</Slot>
            );
          }

          slotGroupPosition += run;
          return slotGroup;
        })}
      </div>
    );
  }
});
