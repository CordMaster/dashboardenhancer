import React, { useState, useEffect, useMemo } from 'react';

import Immutable, { List, Map } from 'immutable';

import $ from 'jquery';
import Color from 'color';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

import { endpoint, access_token, hubIp, devMode } from '../Constants.js';
import { devLog } from '../Utils.js';

export const MainContext = React.createContext({});

const websocket = new WebSocket(`ws://${hubIp}/eventsocket`);

//util for autogen configs
function useConfig(fields) {
  //so we can update multiple items in the state at once
  let preStateUpdate = {};

  let def = {};
  fields.forEach((it) => {
    def[it.name] = it.default;
  });

  const [state, setState] = useState(def);

  let ret = {};
  let setRet = {};
  Object.entries(state).forEach(([key, val]) => {
    ret[key] = val;
    setRet[`set${key.charAt(0).toUpperCase() + key.substring(1)}`] = (newVal) => {
      preStateUpdate[key] = newVal;
      setState(Object.assign({}, state, preStateUpdate));
    }
  });

  const mergeAll = (other) => {
    setState(Object.assign({}, state, other));
  }

  return [ret, setRet, mergeAll];
}

//util for devices
function useDevices(loading) {
  const [devices, setDevices] = useState(new Map());
  const objDevices = useMemo(() => devices.toJS(), [devices]);

  //so we can update multiple items in the state at once
  let preStateUpdate = devices;

  //attach websocket
  useEffect(() => {
    //if loaded
    if(loading === 0 && Object.keys(objDevices).length > 0) {
      websocket.onmessage = (resp) => {
        const data = JSON.parse(resp.data);

        devLog(data);

        //update our cache
        if(data.deviceId && data.name && data.value) {
          const attrIndex = objDevices[data.deviceId].attr.findIndex(it => it[data.name]);
          preStateUpdate = preStateUpdate.updateIn([ '' + data.deviceId, 'attr', attrIndex ], value => { return { ...value, [data.name]: data.value } }); //eslint-disable-line
          setDevices(preStateUpdate);
        }
      };
    }
  }, [loading, devices, objDevices]);

  return [devices, setDevices];
}

function MainContextProvider(props) {
  //go down loading by 1 til we get to 0
  const [loading, setLoading] = useState(3);

  const [state, setState] = useState(Map({
    dashboards: List([])
  }));

  const objState = useMemo(() => state.toJS(), [state]);

  const [devices, setDevices] = useDevices(loading);

  const [config, setConfig, mergeAllConfig] = useConfig([{ name: 'iconsOnly', default: false }, { name: 'defaultDashboard', default: -1 }, { name: 'title', default: 'Panels' }, { name: 'theme', default: 'light' }, { name: 'fontSize', default: 16 }, { name: 'showBadges', default: false },
  { name: 'overrideColors', default: false }, { name: 'overrideBG', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }, { name: 'overrideFG', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overridePrimary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overrideSecondary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } },
  { name: 'showClock', default: true }, { name: 'clockOnTop', default: false }, { name: 'showClockAttributes', default: false }, { name: 'clockAttr1Label', default: 'At1' }, { name: 'clockAttr2Label', default: 'At2:' }, { name: 'clockAttr1', default: { device: '', attribute: '' } }, { name: 'clockAttr2', default: { device: '', attribute: '' } }, { name: 'lockSettings', default: true }, { name: 'lockFully', default: false } ]);

  const [allDashboards, setAllDashboards] = useState([]);

  const [genTheme, setGenTheme] = useState(createMuiTheme({}));

  //locally stored lock
  const [locked, _setLocked] = useState(window.localStorage.getItem('locked') === null ? -1 : parseInt(window.localStorage.getItem('locked')));
  
  const setLocked = code => {
    _setLocked(code);
    window.localStorage.setItem('locked', code);
  }

  useEffect(() => {
    let preGen = {
      palette: {
        type: config.theme,
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
      const newData = Map(Object.assign({ iconName: "Home", lock: false, label: allDashboards.find((val) => val.id === obj.data.id).label }, obj.data));

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
      } else if(loading === 2) {
        //load all dashboards from hub
        $.get(`${endpoint}getDashboards/?access_token=${access_token}`, (data) => {
          setAllDashboards(data.dashboards);

          devLog(`Got all dashboards`);
        }).always(() => {
          setLoading(1);
        });
      } else if(loading === 1 && objState.dashboards.length > 0) {
        //load device data from the first dashboard
        //get devices
        $.get(`${endpoint}getDashboardDevices/${objState.dashboards[0].id}/?access_token=${access_token}`, (data) => {
          //map devices to device id
          const cleanData = {};
          data.forEach(it => cleanData[it.id] = it);
          setDevices(Immutable.fromJS(cleanData));

          devLog(`Got devices:`);
          devLog(cleanData);
        }).always(() => {
          setLoading(0);
        });
      } else setLoading(0);
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
    <MainContext.Provider value={{ loading, allDashboards, genTheme, ...state.toJS(), modifyDashboards, ...config, ...setConfig, devices: devices.toJS(), locked, setLocked, save }}>
      {props.children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;