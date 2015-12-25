import React from 'react';

export const Bank = React.createClass({
  render() {
    const {tiles, onTileClick} = this.props;
    return (
      <ul>
        {tiles.map((tile) => {
          return (
            <li
              key={tile.get('id')}
              onClick={() => {
                onTileClick(tile.get('id'));
              }}
            >{tile.get('letter')}</li>
          );
        })}
      </ul>
    );
  }
});
