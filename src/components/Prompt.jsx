import React from 'react';

export const Prompt = React.createClass({
  render() {
    const {children} = this.props;
    return <p>{children}</p>;
  }
});
