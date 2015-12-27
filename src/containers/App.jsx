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
      guess,
      prompt,
      selectedTileId,
      solution,
      tiles
    } = this.props;

    return (
      <div className={styles.app}>
        <Prompt>{prompt}</Prompt>
        <Guess
          guess={guess}
          solution={solution}
        />
        <Bank
          onTileClick={(tile) => {
            if (!tile.used) {
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
  guess: state.get('guess'),
  prompt: state.get('prompt'),
  selectedTileId: state.get('selectedTileId'),
  solution: state.get('solution'),
  tiles: state.get('tiles')
});
export default connect(mapStateToProps)(App);
