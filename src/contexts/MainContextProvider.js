import React, { useState, useEffect } from 'react';

import Immutable, { List, Map } from 'immutable';

import $ from 'jquery';
import Color from 'color';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

import { endpoint, access_token } from '../Constants.js';

export const MainContext = React.createContext({});

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

function MainContextProvider(props) {
  const [state, setState] = useState(Map({
    dashboards: List([])
  }));

  const [config, setConfig, mergeAllConfig] = useConfig([{ name: 'iconsOnly', default: false }, { name: 'defaultDashboard', default: -1 }, { name: 'title', default: 'Panels' }, { name: 'theme', default: 'light' }, { name: 'fontSize', default: 16 },
  { name: 'overrideColors', default: false }, { name: 'overrideBG', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }, { name: 'overrideFG', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overridePrimary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }, { name: 'overrideSecondary', default: { r: 0, b: 0, g: 0, alpha: 1.0 } }]);

  //go down loading by 1 til we get to 0
  const [loading, setLoading] = useState(2);
  const [token, setToken] = useState('');
  const [allDashboards, setAllDashboards] = useState([]);

  const [genTheme, setGenTheme] = useState(createMuiTheme({}));

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

  const objState = state.toJS();

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
      const newData = Map(Object.assign({ iconName: "Home", label: allDashboards.find((val) => val.id === obj.data.id).label }, obj.data));

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
      if(loading === 2) {
        $.get(`${endpoint}options/?access_token=${access_token}`, (data) => {
          if(!data.error) {
            if(data.state) setState(Immutable.fromJS(data.state));
            delete data.state;
            mergeAllConfig(data);
          }
        }).always(() => {
          setLoading(loading - 1);
        });
      } else if(loading === 1) {
        //load all dashboards from hub
        if(access_token && !objState.token) {
          $.get(`${endpoint}getDashboards/?access_token=${access_token}`, (data) => {
            setToken(data.token);
            setAllDashboards(data.dashboards);
          }).always(() => {
            setLoading(loading - 1);
          });
        }
      }
    } else {
      setLoading(0);
    }
  }, [loading, mergeAllConfig, objState.token]);

  const save = () => {
    //save
    if(access_token) {
      $.ajax(`${endpoint}options/?access_token=${access_token}`, {
        type: 'POST',
        contentType: "multipart/form-data",
        data: JSON.stringify({ state: objState, ...config })
      });
    }
  }

  return (
    <MainContext.Provider value={{ loading, token, allDashboards, genTheme, ...state.toJS(), modifyDashboards, ...config, ...setConfig, save }}>
      {props.children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;