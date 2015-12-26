import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import {convertApiChallengeToState} from './actions';
import App from './containers/App';
import app from './reducers';

const middleWare = [];

if (DEV) {
  const logger = createLogger({
    collapsed: true,
    stateTransformer: (state) => state.toJS()
  });
  middleWare.push(logger);
}

const initialState = convertApiChallengeToState(window.initialData);
const createStoreWithMiddleware = applyMiddleware(...middleWare)(createStore);
const store = createStoreWithMiddleware(app, initialState);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
