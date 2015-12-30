import React from 'react';
import {connect} from 'react-redux';
import {addTile, hydrateNewQuestion, removeTile} from '../actions';
import {Bank} from '../components/Bank';
import {Guess} from '../components/Guess';
import {Prompt} from '../components/Prompt';
import {QuestionMetadata} from '../components/QuestionMetadata';
import styles from '../containers/App.scss';

const App = React.createClass({
  render() {
    const {
      currentQuestion,
      dispatch
    } = this.props;

    const {
      category,
      difficulty,
      filteredSolution,
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
      <div className={styles.app}>
        <QuestionMetadata
          category={category}
          difficulty={difficulty}
        />
        <Prompt>{prompt}</Prompt>
        <Guess
          guess={guess}
          onPromptClick={() => {
            guessTileIds.size && dispatch(removeTile(guessTileIds.last()));
          }}
          solutionRuns={solutionRuns}
          solved={solved}
        />
        <Bank
          onTileClick={tile => {
            if (!tile.used && guess.length < filteredSolution.length) {
              dispatch(addTile(tile.id, tile.char));
            }
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
  currentQuestion: state.get('currentQuestion')
});
export default connect(mapStateToProps)(App);
