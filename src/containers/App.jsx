import React from 'react';
import {connect} from 'react-redux';
import {addTile} from '../actions';

const App = React.createClass({
  render() {
    const {dispatch, tiles} = this.props;
    return (
      <ul>
        {tiles.map((tile) => {
          return (
            <li
              key={tile.get('id')}
              onClick={() => {
                dispatch(addTile(tile.get('id')));
              }}
            >{tile.get('letter')}</li>
          );
        })}
      </ul>
    );
  }
});

const mapStateToProps = (state) => {
  return {
    tiles: state.get('tiles')
  };
};

export default connect(mapStateToProps)(App);
