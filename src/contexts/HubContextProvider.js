import React, { useState, useEffect, useContext, useMemo} from 'react';
import $ from 'jquery';
import Immutable, { Map } from 'immutable';
import { hubIp, endpoint, access_token } from '../Constants';
import { LoadingContext } from './LoadingContextProvider';
import { devLog } from '../Utils';

export const HubContext = React.createContext();

const websocket = new WebSocket(`ws://${hubIp}/eventsocket`);

//util for devices
function useHub() {
  const { loading, setLoading } = useContext(LoadingContext);

  const [allDashboards, setAllDashboards] = useState([]);

  const [devices, setDevices] = useState(new Map());
  const objDevices = useMemo(() => devices.toJS(), [devices]);

  //so we can update multiple items in the state at once
  let preStateUpdate = devices;
  
  //for the first load
  useEffect(() => {
    //load last
    if(loading === 2) {
      $.get(`${endpoint}getDashboards/?access_token=${access_token}`, (data) => {
        setAllDashboards(data.dashboards);

        devLog(`Got all dashboards`);
      }).always(() => {
        setLoading(1);
      });
    }
    else if(loading === 1) {
      $.get(`${endpoint}getDashboardDevices/${allDashboards[0].id}/?access_token=${access_token}`, (data) => {
        //map devices to device id
        const cleanData = {};
        data.forEach(it => cleanData[it.id] = it);
        setDevices(Immutable.fromJS(cleanData));

        devLog(`Got devices:`);
        devLog(cleanData);
      }).always(() => {
        setLoading(0);
      });
    }
  }, [loading]);


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

  return [objDevices, allDashboards];
}

export default function({ children }) {
  const [devices, allDashboards] = useHub();

  return (
    <HubContext.Provider value={{ devices, allDashboards }}>
      {children}
    </HubContext.Provider>
  )
}