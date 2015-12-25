import React from 'react';
import {connect} from 'react-redux';
import {addTile} from '../actions';
import {Bank} from '../components/Bank';

const App = React.createClass({
  render() {
    const {dispatch, tiles} = this.props;
    return (
      <Bank
        tiles={tiles}
        onTileClick={(tileId) => {
          dispatch(addTile(tileId));
        }}
      />
    );
  }
});

const mapStateToProps = (state) => {
  return {
    tiles: state.get('tiles')
  };
};

export default connect(mapStateToProps)(App);
