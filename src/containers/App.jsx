import classNames from 'classnames';
import React from 'react';
import {connect} from 'react-redux';

import {
  addTile,
  hydrateNewQuestion,
  removeTile,
  useHint
} from 'actions';
import {Bank} from 'components/Bank';
import {Guess} from 'components/Guess';
import {Prompt} from 'components/Prompt';
import {QuestionMetadata} from 'components/QuestionMetadata';
import styles from 'containers/App.scss';
import {exit} from 'util/navigation';

const App = React.createClass({
  render() {
    const {
      currentQuestion,
      dispatch,
      hints,
      seenQuestions
    } = this.props;

    const {
      category,
      difficulty,
      guess,
      guessTileIds,
      prompt,
      selectedTileId,
      solutionRuns,
      solved,
      tiles
    } = currentQuestion ? currentQuestion.toObject() : {};

    solved && dispatch(hydrateNewQuestion(false));

    return (
      <div
        className={classNames(
          styles.app,
          {
            [styles.hidden]: !category
          }
        )}
      >
        <QuestionMetadata
          category={category}
          difficulty={difficulty}
          hints={hints}
          seenQuestions={seenQuestions}
          selectedTileId={selectedTileId}
          solved={solved}
        />
        <Prompt>{prompt}</Prompt>
        <Guess
          guess={guess}
          guessTileIds={guessTileIds}
          onPromptClick={() => {
            dispatch(removeTile());
          }}
          solutionRuns={solutionRuns}
          solved={solved}
        />
        <Bank
          hints={hints}
          onExitClick={exit}
          onHintClick={() => {
            dispatch(useHint());
          }}
          onTileClick={tile => {
            dispatch(addTile(tile.id));
          }}
          selectedTileId={selectedTileId}
          solved={solved}
          tiles={tiles}
        />
      </div>
    );
  }
});

const mapStateToProps = state => ({
  currentQuestion: state.get('currentQuestion'),
  hints: state.get('hints'),
  seenQuestions: state.get('seenQuestions')
});
export default connect(mapStateToProps)(App);
