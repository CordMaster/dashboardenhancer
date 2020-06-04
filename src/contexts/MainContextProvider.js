import React, { useState, useEffect, useMemo } from 'react';

import Immutable, { List, Map } from 'immutable';

import $ from 'jquery';
import Color from 'color';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

import { endpoint, access_token, openWeatherToken } from '../Constants.js';
import { devLog } from '../Utils.js';
import { useContext } from 'react';
import { LoadingContext } from './LoadingContextProvider.js';

export const MainContext = React.createContext({});

export const settings = {
  'title': {
    sectionLabel: 'Title',
    dependsOn: [{ name: 'iconsOnly', value: false }],
    sectionOptions: [
      { name: 'showTitle', label: 'Show Title', type: 'boolean', default: true },
      { name: 'title', label: 'Title', type: 'text', default: 'Panel', dependsOn: [{ name: 'showTitle', value: true }] }
    ]
  },

  'lock': {
    sectionLabel: 'Lock Settings',
    sectionOptions: [
      { name: 'lockCode', label: 'Lock code', type: 'number', default: '' },
      { name: 'lockSettings', label: 'Disable settings when locked', type: 'boolean', default: false },
      { name: 'lockFully', label: 'Disable viewing selected dashboards when locked', type: 'boolean', default: false }
    ]
  },

  'drawer': {
    sectionLabel: 'Drawer Settings',
    sectionOptions: [
      { name: 'iconsOnly', label: 'Icons only', type: 'boolean', default: false, affects: [{ value: true, name: 'showTitle', setTo: false }, { value: true, name: 'showClock', setTo: false }, { value: true, name: 'showWeather', setTo: false }] },
      { name: 'showBadges', label: 'Show badges', type: 'boolean', default: false },
      { name: 'showClock', label: 'Show clock', type: 'boolean', default: true, dependsOn:[{ name: 'iconsOnly', value: false }], disableOnDepends: true, affects: [{ value: false, name: 'showClockAttributes', setTo: false }] },
      { name: 'showWeather', label: 'Show weather', type: 'boolean', default: false, dependsOn: [{ name: () => openWeatherToken !== null, value: true }, { name: 'iconsOnly', value: false }], disableOnDepends: true }
    ]
  },

  'clock': {
    sectionLabel: 'Clock Settings',
    dependsOn: [{ name: 'showClock', value: true }],
    sectionOptions: [
      { name: 'clockOnTop', label: 'Show clock on top', type: 'boolean', default: false },
      { name: 'showClockAttributes', label: 'Show attributes from devices', type: 'boolean', default: false }
    ]
  },

  'clockAttrs': {
    sectionLabel: 'Clock Device Attributes',
    dependsOn: [{ name: 'showClockAttributes', value: true }],
    sectionOptions: [
      { name: 'clockAttr1Label', label: '1st attribute label', type: 'text', default: 'Attr1' },
      { name: 'clockAttr1', label: '1st attribute', type: 'deviceattribute', default: { device: '', attribute: '' } },

      { name: 'clockAttr2Label', label: '2nd attribute label', type: 'text', default: 'Attr2' },
      { name: 'clockAttr2', label: '2nd attribute', type: 'deviceattribute', default: { device: '', attribute: '' } }
    ]
  },

  'weather': {
    sectionLabel: 'Weather Settings',
    dependsOn: [{ name: 'showWeather', value: true }],
    sectionOptions: [
      { name: 'useHubDeviceForIndoorTemp', label: 'Use a hub device for the indoor temperature', type: 'boolean', default: false },
      { name: 'useHubDeviceForOutdoorTemp', label: 'Use a hub device for the outdoor temperature', type: 'boolean', default: false },
    ]
  },


  'font': {
    sectionLabel: 'Font Size',
    saveBuffer: true,
    sectionOptions: [
      { name: 'fontSize', label: 'Font Size', type: 'number', default: 12 },
    ]
  },

  'theme': {
    sectionLabel: 'Theme',
    sectionOptions: [
      { name: 'darkTheme', label: 'Dark Theme', type: 'boolean', default: false },
      { name: 'overrideColors', label: 'Custom Theme', type: 'boolean', default: false }
    ]
  },

  'themeColors': {
    sectionLabel: 'Custom Theme Colors',
    saveBuffer: true,
    dependsOn: [{ name: 'overrideColors', value: true }],
    sectionOptions: [
      { name: 'overrideBG', label: 'Background Color', type: 'color', default: { r: 50, b: 50, g: 50, alpha: 1.0 } },
      { name: 'overrideFG', label: 'Foreground Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overridePrimary', label: 'Primary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overrideSecondary', label: 'Secondary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }
    ]
  },

  'none': {
    noShow: true,
    sectionOptions: [
      { name: 'defaultDashboard', type: 'number', default: -1 },
    ]
  }
};

//util for autogen configs
function useConfig() {
  //so we can update multiple items in the state at once
  let preStateUpdate = {};

  let def = {};
  
  Object.values(settings).forEach((section) => {
    section.sectionOptions.forEach(field => {
      def[field.name] = field.default;
    });
  });

  const [state, setState] = useState(def);

  function updateAffects(field, newVal) {
    field.affects.forEach(affected => {
      if(newVal === affected.value) {
        preStateUpdate[affected.name] = affected.setTo;
  
        //recursive changes
        //find field affected
        const affectedField = Object.values(settings).reduce((sum, section) => {
          const affectedFieldIndex = section.sectionOptions.findIndex(field => field.name === affected.name);
          if(affectedFieldIndex !== -1) return section.sectionOptions;
          else return sum;
        }, []);
        if(affectedField.affects) updateAffects(affectedField, affected.setTo);
      };
    });
  }

  let ret = {};
  let setRet = {};
  Object.entries(settings).forEach(([sectionName, section]) => {
    section.sectionOptions.forEach(field => {
    
    ret[field.name] = state[field.name];
    setRet[field.name] = (newVal) => {
      //set the state
      preStateUpdate[field.name] = newVal;

      //set the other states
      if(field.affects) {
        updateAffects(field, newVal);
      }

      setState(Object.assign({}, state, preStateUpdate));
    }
  });
});

  const mergeAll = (other) => {
    setState(Object.assign({}, state, other));
  }

  return [ret, setRet, mergeAll];
}

function MainContextProvider(props) {
  const { loading, setLoading } = useContext(LoadingContext);

  const [state, setState] = useState(Map({
    dashboards: List([])
  }));

  const objState = useMemo(() => state.toJS(), [state]);

  //const [config, setConfig, mergeAllConfig] = useConfig([{ name: 'iconsOnly', default: false }, { name: 'defaultDashboard', default: -1 }, { name: 'title', default: 'Panels' }, { name: 'theme', default: 'light' }, { name: 'fontSize', default: 16 }, { name: 'showBadges', default: false },
  //{ name: 'overrideColors', default: false }, { name: 'overrideBG', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }, { name: 'overrideFG', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overridePrimary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overrideSecondary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } },
  //{ name: 'showClock', default: true }, { name: 'clockOnTop', default: false }, { name: 'showClockAttributes', default: false }, { name: 'clockAttr1Label', default: 'At1' }, { name: 'clockAttr2Label', default: 'At2:' }, { name: 'clockAttr1', default: { device: '', attribute: '' } }, { name: 'clockAttr2', default: { device: '', attribute: '' } }, { name: 'lockSettings', default: true }, { name: 'lockFully', default: false } ]);

  const [config, setConfig, mergeAllConfig] = useConfig();

  //locally stored lock
  const [locked, _setLocked] = useState(window.localStorage.getItem('locked') === null ? -1 : parseInt(window.localStorage.getItem('locked')));

  const setLocked = code => {
    _setLocked(code);
    window.localStorage.setItem('locked', code);
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

  const modifyDashboards = (obj) => {
    const type = obj.type;
    if(type === "move") {
      const { startIndex, destIndex } = obj;
      const startObj = objState.dashboards[startIndex];
      const newArr = state.get("dashboards").splice(startIndex, 1).insert(destIndex, startObj);

      setState(state.set("dashboards", newArr));
    } else if(type === "delete") {
      const index = obj.index;

      const newArr = state.get("dashboards").splice(index, 1);

      setState(state.set("dashboards", newArr));
    } else if(type === "new") {
      const index = obj.index;
      const newData = Map(Object.assign({ iconName: "Home", lock: false }, obj.data));

      const newArr = state.get("dashboards").splice(index, 0, newData);

      setState(state.set("dashboards", newArr));
    } else if(type === "modify") {
      const index = obj.index;
      const newData = obj.data;

      const newDashboard = state.get("dashboards").get(index).merge(newData);
      const newArr = state.get("dashboards").set(index, newDashboard);

      setState(state.set("dashboards", newArr));
    }
  }

  //state save/load
  useEffect(() => {
    //allow using no access token
    if(access_token) {
      if(loading === 3) {
        $.get(`${endpoint}options/?access_token=${access_token}`, (data) => {
          if(!data.error) {
            if(data.state) setState(Immutable.fromJS(data.state));
            delete data.state;
            mergeAllConfig(data);

            devLog(`Got config`);
          }
        }).always(() => {
          setLoading(2);
        });
      }
    } else {
      if(loading !== 0) setLoading(0);
    }
  }, [loading]);

  const save = () => {
    return $.ajax(`${endpoint}options/?access_token=${access_token}`, {
      type: 'POST',
      contentType: "multipart/form-data",
      data: JSON.stringify({ state: objState, ...config })
    });
  }

  return (
    <MainContext.Provider value={{ genTheme, ...objState, modifyDashboards, config, setConfig, locked, setLocked, save }}>
      {props.children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;