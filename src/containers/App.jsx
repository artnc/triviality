import React from 'react';
import {connect} from 'react-redux';
import {addTile} from '../actions';
import {Bank} from '../components/Bank';

const App = React.createClass({
  render() {
    const {
      cols,
      dispatch,
      rows,
      tiles
    } = this.props;

    return (
      <Bank
        cols={cols}
        onTileClick={(tileId) => {
          dispatch(addTile(tileId));
        }}
        rows={rows}
        tiles={tiles}
      />
    );
  }
});

const mapStateToProps = (state) => state.toObject();
export default connect(mapStateToProps)(App);
