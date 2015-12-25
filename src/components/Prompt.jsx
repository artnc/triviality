import React from 'react';
import {createPureComponent} from '../util/react';

export const Prompt = createPureComponent({
  render() {
    const {children} = this.props;
    return <p>{children}</p>;
  }
});
