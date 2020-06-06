import React, { useState, useEffect, useContext, useMemo} from 'react';
import $ from 'jquery';
import Immutable, { Map } from 'immutable';
import { hubIp, endpoint, access_token } from '../Constants';
import { LoadingContext } from './LoadingContextProvider';
import { devLog } from '../Utils';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const HubContext = React.createContext();

const websocket = new ReconnectingWebSocket(`ws://${hubIp}/eventsocket`);

websocket.addEventListener('open', () => {
  devLog('Websocket opened');
});

websocket.addEventListener('error', () => {
  devLog('Websocket closed. Reconnecting...');
});

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
        //map devices to device id and attrs
        const cleanData = {};
        data.map(device => {
          if(device.attr) device.attr = device.attr.reduce((sum, obj) => {
            const parts = Object.entries(obj);
            const [name, value] = parts[0];

            sum[name] = { name, value, unit: obj.unit };

            return sum;
          }, {});
          return device;
        });
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
    const onMessage = (resp) => {
      const data = JSON.parse(resp.data);

      devLog(data);

      //update our cache
      if(data.source === 'DEVICE' && data.deviceId && data.name && data.value) {
        preStateUpdate = preStateUpdate.updateIn([ '' + data.deviceId, 'attr', data.name, 'value' ], props => data.value); //eslint-disable-line
        setDevices(preStateUpdate);
      }
    }

    if(loading === 0 && Object.keys(objDevices).length > 0) websocket.addEventListener('message', onMessage);

    return () => {
      websocket.removeEventListener('message', onMessage);
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