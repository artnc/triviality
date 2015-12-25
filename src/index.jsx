import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {convertApiChallengeToState} from './actions';
import App from './containers/App';
import app from './reducers';

const initialState = convertApiChallengeToState(window.initialData);
const store = createStore(app, initialState);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
