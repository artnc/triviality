import React from 'react';
import {connect} from 'react-redux';
import {addTile} from '../actions';
import {Bank} from '../components/Bank';
import {Prompt} from '../components/Prompt';
import styles from '../containers/App.scss';

const App = React.createClass({
  render() {
    const {
      dispatch,
      prompt,
      tiles
    } = this.props;

    return (
      <div className={styles.app}>
        <Prompt>{prompt}</Prompt>
        <Bank
          onTileClick={(tileId) => {
            dispatch(addTile(tileId));
          }}
          tiles={tiles}
        />
      </div>
    );
  }
});

const mapStateToProps = (state) => state.toObject();
export default connect(mapStateToProps)(App);
