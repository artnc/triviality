import React from 'react';
import {createPureComponent} from '../util/react';
// import styles from '../components/Guess.scss';

export const Guess = createPureComponent({
  render() {
    const {guess} = this.props;
    return <p>{guess}</p>;
  }
});
