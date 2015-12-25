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
}

const mapStateToProps = (state) => {
  return {
    tiles: state.get('tiles')
  };
};

export default connect(mapStateToProps)(App);
