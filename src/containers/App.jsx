import React from 'react';
import {connect} from 'react-redux';
import {addTile, pushHistoryState} from '../actions';
import {Bank} from '../components/Bank';
import {Guess} from '../components/Guess';
import {Prompt} from '../components/Prompt';
import styles from '../containers/App.scss';

const App = React.createClass({
  render() {
    const {
      dispatch,
      filteredSolution,
      guess,
      prompt,
      selectedTileId,
      solutionRuns,
      tiles
    } = this.props;

    return (
      <div className={styles.app}>
        <Prompt>{prompt}</Prompt>
        <Guess
          guess={guess}
          solutionRuns={solutionRuns}
        />
        <Bank
          onTileClick={(tile) => {
            if (!tile.used && guess.length < filteredSolution.length) {
              dispatch(pushHistoryState());
              dispatch(addTile(tile.id, tile.letter));
            }
          }}
          selectedTileId={selectedTileId}
          tiles={tiles}
        />
      </div>
    );
  }
});

const mapStateToProps = (state) => ({
  filteredSolution: state.get('filteredSolution'),
  guess: state.get('guess'),
  prompt: state.get('prompt'),
  selectedTileId: state.get('selectedTileId'),
  solutionRuns: state.get('solutionRuns'),
  tiles: state.get('tiles')
});
export default connect(mapStateToProps)(App);
