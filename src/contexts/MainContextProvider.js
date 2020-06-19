import React, { useState, useEffect, useMemo } from 'react';

import Immutable, { List, Map } from 'immutable';
import { v4 as uuidv4 } from 'uuid';

import $ from 'jquery';
import Color from 'color';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

import { endpoint, access_token, openWeatherToken } from '../Constants.js';
import { devLog } from '../Utils.js';
import { useContext } from 'react';
import { LoadingContext } from './LoadingContextProvider.js';
import useCollection from './useCollection.js';
import usseSettingsDefinition from '../definitions/usseSettingsDefinition.js';
import settingsDefinitons from '../definitions/settingsDefinitons.js';

export const MainContext = React.createContext({});

function MainContextProvider(props) {
  const { loading, setLoading } = useContext(LoadingContext);

  const [dashboards, modifyDashboards] = useCollection(List(), { iconName: "Home", lock: false, tiles: Map() });

  const objDashboards = useMemo(() => dashboards.toJS(), [dashboards]);

  //const [config, setConfig, mergeAllConfig] = useConfig([{ name: 'iconsOnly', default: false }, { name: 'defaultDashboard', default: -1 }, { name: 'title', default: 'Panels' }, { name: 'theme', default: 'light' }, { name: 'fontSize', default: 16 }, { name: 'showBadges', default: false },
  //{ name: 'overrideColors', default: false }, { name: 'overrideBG', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }, { name: 'overrideFG', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overridePrimary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overrideSecondary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } },
  //{ name: 'showClock', default: true }, { name: 'clockOnTop', default: false }, { name: 'showClockAttributes', default: false }, { name: 'clockAttr1Label', default: 'At1' }, { name: 'clockAttr2Label', default: 'At2:' }, { name: 'clockAttr1', default: { device: '', attribute: '' } }, { name: 'clockAttr2', default: { device: '', attribute: '' } }, { name: 'lockSettings', default: true }, { name: 'lockFully', default: false } ]);

  const [config, setConfig, mergeAllConfig] = usseSettingsDefinition(settingsDefinitons);

  //locally stored lock
  const [locked, _setLocked] = useState(window.localStorage.getItem('locked') === null ? -1 : parseInt(window.localStorage.getItem('locked')));

  const setLocked = (desired) => {
    const code = config.lockCode;
    if (desired === false) {
      _setLocked(-1);
      window.localStorage.setItem('locked', -1);
      return true;
    }
    else if(desired === true && code) {
      _setLocked(code);
      window.localStorage.setItem('locked', code);
      return true;
    }else return false;
  }

  const [genTheme, setGenTheme] = useState(createMuiTheme({}));
  
  useEffect(() => {
    let preGen = {
      palette: {
        type: config.darkTheme ? 'dark' : 'light',
      },

      typography: {
        fontSize: config.fontSize
      }
    }

    if(config.overrideColors) {
      preGen.palette.primary = { main: Color(config.overridePrimary).rgb().string() };
      preGen.palette.secondary = { main: Color(config.overrideSecondary).rgb().string() };
      preGen.palette.background = { paper: Color(config.overrideBG).rgb().string() };
      preGen.palette.text = { primary: Color(config.overrideFG).rgb().string() };
    }

    let theme = createMuiTheme(preGen);
    theme = responsiveFontSizes(theme);

    setGenTheme(theme);
  }, [config.theme, config.fontSize, config.overrideColors, config.overrideBG, config.overrideFG, config.overridePrimary, config.overrideSecondary]);

  //state save/load
  useEffect(() => {
    //allow using no access token
    if(access_token) {
      if(loading === 0) {
        $.get(`${endpoint}options/?access_token=${access_token}`, (data) => {
          if(!data.error) {
            mergeAllConfig(data);

            devLog(`Got config`);
          }
        }).always(() => {
          setLoading(10);
        });
      }
    } else {
      if(loading < 10) setLoading(10);
    }
  }, [loading]);

  const save = () => {
    return $.ajax(`${endpoint}options/?access_token=${access_token}`, {
      type: 'POST',
      contentType: "multipart/form-data",
      data: JSON.stringify(config)
    });
  }

  return (
    <MainContext.Provider value={{ genTheme, dashboards: objDashboards, modifyDashboards, config, setConfig, locked, setLocked, save }}>
      {props.children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;