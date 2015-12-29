import React from 'react';
import {connect} from 'react-redux';
import {addTile, removeTile} from '../actions';
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
      guessTileIds,
      prompt,
      selectedTileId,
      solutionRuns,
      solved,
      tiles
    } = this.props;

    return (
      <div className={styles.app}>
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
          onTileClick={(tile) => {
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

const mapStateToProps = (state) => ({
  filteredSolution: state.get('filteredSolution'),
  guess: state.get('guess'),
  guessTileIds: state.get('guessTileIds'),
  prompt: state.get('prompt'),
  selectedTileId: state.get('selectedTileId'),
  solutionRuns: state.get('solutionRuns'),
  solved: state.get('solved'),
  tiles: state.get('tiles')
});
export default connect(mapStateToProps)(App);
