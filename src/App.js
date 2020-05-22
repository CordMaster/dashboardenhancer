import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { endpoint } from './Constants.js'

import MainContextProvider from './contexts/MainContextProvider.js';
import MainContainer from './MainContainer.js';

function App() {
  return (
    <Router basename={`${endpoint.substr(endpoint.indexOf('/', 7))}main`}>
      <MainContextProvider>
          <MainContainer />
      </MainContextProvider>
    </Router>
  );
}

export default App;
