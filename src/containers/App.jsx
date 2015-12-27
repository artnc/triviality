import React from 'react';
import {connect} from 'react-redux';
import {addTile, popHistoryState, pushHistoryState} from '../actions';
import {Bank} from '../components/Bank';
import {Prompt} from '../components/Prompt';
import styles from '../containers/App.scss';

const App = React.createClass({
  render() {
    const {
      dispatch,
      prompt,
      selectedTileId,
      tiles
    } = this.props;

    return (
      <div className={styles.app}>
        <Prompt>{prompt}</Prompt>
        <Bank
          onTileClick={(tileId) => {
            if ((Math.floor(Date.now() / 1000) % 2)) { // second is odd
              dispatch(pushHistoryState());
              dispatch(addTile(tileId));
            } else {
              dispatch(popHistoryState());
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
  prompt: state.get('prompt'),
  selectedTileId: state.get('selectedTileId'),
  tiles: state.get('tiles')
});
export default connect(mapStateToProps)(App);
