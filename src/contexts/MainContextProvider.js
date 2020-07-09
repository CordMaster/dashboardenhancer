import React, { useState, useEffect, useMemo } from 'react';

import Immutable from 'immutable';
import merge from 'deepmerge';

import $ from 'jquery';
import Color from 'color';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

import { endpoint, access_token, defaultDashboards } from '../Constants.js';
import { devLog } from '../Utils.js';
import { useContext } from 'react';
import { LoadingContext } from './LoadingContextProvider.js';
import useCollection from './useCollection.js';
import useSettingsDefinition from '../definitions/useSettingsDefinition.js';
import settingsDefinitons from '../definitions/settingsDefinitons.js';
import defaultHubitatTileDefinitions from '../components/hubitatTileMaker/defaultHubitatTileDefinitions.js';
import tileMappings from '../components/tiles/tileMappings.js';

export const MainContext = React.createContext({});

function MainContextProvider(props) {
  const { loading, setLoading } = useContext(LoadingContext);

  const [dashboards, modifyDashboards, setDashboards] = useCollection(defaultDashboards, { iconName: "mdiHome", lock: false, backgroundColor: { r: 255, g: 255, b: 255, alpha: 1 }, tiles: [] });

  const hubitatTileDefinitionTemplate = { 
    iconName: "mdiApplication", 
    
    sections: {
      primary: {
        enabled: false,
        type: 'none'
      },

      secondary: {
        enabled: false,
        type: 'none'
      },

      tl: {
        enabled: false,
        type: 'none'
      },

      tr: {
        enabled: false,
        type: 'none'
      },

      bl: {
        enabled: false,
        type: 'none'
      },

      br: {
        enabled: false,
        type: 'none'
      },

      label: {
        enabled: true,
        type: 'text',

        value: {
          type: 'constant',
          value: '%deviceName%'
        },

        color: {
          type: 'none'
        },

        size: {
          type: 'none'
        }
      },

      optionOverrides: {
        'padding.padding': {
          type: 'none'
        },

        'colors.backgroundColor': {
          type: 'none',
        }
      }
    }
  }

  const [hubitatTileDefinitions, modifyHubitatTileDefinitions, setHubitatTileDefinitions] = useCollection([], hubitatTileDefinitionTemplate);

  //const [config, setConfig, mergeAllConfig] = useConfig([{ name: 'iconsOnly', default: false }, { name: 'defaultDashboard', default: -1 }, { name: 'title', default: 'Panels' }, { name: 'theme', default: 'light' }, { name: 'fontSize', default: 16 }, { name: 'showBadges', default: false },
  //{ name: 'overrideColors', default: false }, { name: 'overrideBG', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }, { name: 'overrideFG', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overridePrimary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overrideSecondary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } },
  //{ name: 'showClock', default: true }, { name: 'clockOnTop', default: false }, { name: 'showClockAttributes', default: false }, { name: 'clockAttr1Label', default: 'At1' }, { name: 'clockAttr2Label', default: 'At2:' }, { name: 'clockAttr1', default: { device: '', attribute: '' } }, { name: 'clockAttr2', default: { device: '', attribute: '' } }, { name: 'lockSettings', default: true }, { name: 'lockFully', default: false } ]);

  const [_config, _setConfig] = useState({});
  const [config, setConfig, mergeAllConfig] = useSettingsDefinition(settingsDefinitons, _config, _setConfig);

  //locally stored lock
  const [locked, _setLocked] = useState(window.localStorage.getItem('locked') === null ? '' : window.localStorage.getItem('locked'));

  const setLocked = (desired) => {
    const code = !config.lock.useLockCode ? 'nopass' : config.lock.lockCode;
    if (desired === false) {
      _setLocked('');
      window.localStorage.setItem('locked', '');
      return true;
    }
    else if(desired === true && code) {
      _setLocked(code);
      window.localStorage.setItem('locked', code);
      return true;
    } else return false;
  }

  const [genTheme, setGenTheme] = useState(createMuiTheme({}));
  
  useEffect(() => {
    const themeColorsConfig = config.theme.themeColors;

    let preGen = {
      palette: {
        type: config.theme.darkTheme ? 'dark' : 'light',
      },

      typography: {
        fontSize: config.font.fontSize
      }
    }

    if(config.theme.overrideColors) {
      preGen.palette.primary = { main: Color(themeColorsConfig.overridePrimary).rgb().string() };
      preGen.palette.secondary = { main: Color(themeColorsConfig.overrideSecondary).rgb().string() };
      preGen.palette.background = { paper: Color(themeColorsConfig.overrideBG).rgb().string() };
      preGen.palette.text = { primary: Color(themeColorsConfig.overrideFG).rgb().string() };
    }

    let theme = createMuiTheme(preGen);
    theme = responsiveFontSizes(theme);

    setGenTheme(theme);
  }, [config.theme, config.font, config.themeColors]);

  //state save/load
  useEffect(() => {
    //allow using no access token
    if(access_token) {
      if(loading === 0) {
        $.get(`${endpoint}options/?access_token=${access_token}`, (data) => {
          if(!data.error) {
            mergeAllConfig(data.config ? data.config : {});
            setDashboards(data.dashboards ? data.dashboards.map(dashboard => {
              dashboard.tiles = dashboard.tiles.map(tile => merge({ options: tileMappings[tile.type].defaultOptions }, tile));
              return dashboard;
            }) : []);
            setHubitatTileDefinitions(data.hubitatTileDefinitions ? data.hubitatTileDefinitions.map(it => merge(hubitatTileDefinitionTemplate, it)) : []);

            devLog(`Got config`);
            devLog(data);
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
      contentType: "text/plain",
      data: JSON.stringify({
        config,
        dashboards,
        hubitatTileDefinitions
      })
    });
  }

  return (
    <MainContext.Provider value={{ genTheme, dashboards, modifyDashboards, hubitatTileDefinitions, modifyHubitatTileDefinitions, allHubitatTileDefinitions: [ ...defaultHubitatTileDefinitions, ...hubitatTileDefinitions ], config, setConfig, locked, setLocked, save }}>
      {props.children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;