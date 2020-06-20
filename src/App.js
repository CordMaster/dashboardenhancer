import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { endpoint } from './Constants.js'

import MainContextProvider from './contexts/MainContextProvider.js';
import OpenWeatherContextProvider from './contexts/OpenWeatherContextProvider.js';

import MainContainer from './MainContainer.js';
import HubContextProvider from './contexts/HubContextProvider.js';
import LoadingContextProvider from './contexts/LoadingContextProvider.js';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

function App() {
  return (
    <Router basename={`${endpoint.substr(endpoint.indexOf('/', 7))}main`}>
      <LoadingContextProvider>
        <MainContextProvider>
          <HubContextProvider>
            <OpenWeatherContextProvider>
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <MainContainer />
              </DndProvider>
            </OpenWeatherContextProvider>
          </HubContextProvider>
        </MainContextProvider>
      </LoadingContextProvider>
    </Router>
  );
}

export default App;
