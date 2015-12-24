import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addTile} from '../actions';

class App extends Component {
  render() {
    const {dispatch, tiles} = this.props;
    return (
      <ul>
        {tiles.map((tile) => {
          return (
            <li
              key={tile.id}
              onClick={() => {
                dispatch(addTile(tile.id));
              }}
            >{tile.letter}</li>
          );
        })}
      </ul>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tiles: state.tiles
  };
};

export default connect(mapStateToProps)(App);
