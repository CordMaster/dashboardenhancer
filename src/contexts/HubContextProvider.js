import React, { useState, useEffect, useContext, useMemo} from 'react';
import $ from 'jquery';
import Immutable, { Map } from 'immutable';
import { hubIp, endpoint, access_token } from '../Constants';
import { LoadingContext } from './LoadingContextProvider';
import { devLog } from '../Utils';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MainContext } from './MainContextProvider';

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
  const { dashboards } = useContext(MainContext);

  const [allDashboards, setAllDashboards] = useState({});

  const [devices, setDevices] = useState(new Map());
  const objDevices = useMemo(() => devices.toJS(), [devices]);

  //so we can update multiple items in the state at once
  let preStateUpdate = devices;

  //loadLayout function
  const loadLayout = dashboardId => {
    const tempDashboards = Object.assign({}, allDashboards);
    
    return $.get(`${endpoint}getDashboardLayout/${dashboardId}/?access_token=${access_token}`, (data) => {
      tempDashboards[dashboardId].layout = data;
      devLog(`Got layout for: ${dashboardId}`);
      devLog(data);

      setAllDashboards(tempDashboards);
    });
  }

  const ensureLayoutLoaded = dashboardId => {
    if(!allDashboards.layout) loadLayout(dashboardId); 
  }
  
  //for the first load
  useEffect(() => {
    //load last
    if(loading === 10) {

      $.get(`${endpoint}getDashboards/?access_token=${access_token}`, (data) => {
        let tempDashboards = data.dashboards.reduce((sum, dashboard) => {
          sum[dashboard.id] = dashboard;
          //empty layout for loading
          sum[dashboard.id].layout = { tiles: [] };
          return sum;
        }, {});

        devLog(`Got all dashboards`);
        devLog(tempDashboards);

        setAllDashboards(tempDashboards);
      }).always(() => {
        setLoading(20);
      });
    }

    else if(loading === 20) {
      if(Object.keys(dashboards).length === 0) setLoading(50);

      else {
        let loadedLayouts = 0;

        Object.values(dashboards).forEach((dashboard) => {
          const dashboardId = dashboard.id;
    
          loadLayout(dashboardId).always(() => {
            loadedLayouts++;
            if(loadedLayouts === Object.keys(allDashboards).length) {
              setLoading(50);
            } else {
              setLoading(Math.max(loading, 20 + 30 / Object.keys(dashboards).length * loadedLayouts));
            }
          });
        });
      }
    }

    else if(loading === 50) {
      let devices = {};
      let loadedDevices = 0;

      $.get(`${endpoint}getDevices/?access_token=${access_token}`, (devicesData) => {
        devLog('Got device Ids');
        devLog(devicesData);

        devicesData.forEach(device => {
          devices[device.id] = device;
          $.get(`${endpoint}getDevice/${device.id}/?access_token=${access_token}`, (data) => {
            devices[device.id]['attributes'] = data;

            devLog('Got device data');
            devLog(data);
          }).always(() => {
            loadedDevices++;
            
            if(loadedDevices === devicesData.length) {
              setLoading(100);
            } else {
              setLoading(Math.max(loading, 50 + 50 / devicesData.length * loadedDevices));
            }
          });
        });
      }).fail(() => {
        setLoading(100);
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

    if(loading >= 100 && Object.keys(objDevices).length > 0) websocket.addEventListener('message', onMessage);

    return () => {
      websocket.removeEventListener('message', onMessage);
    }
  }, [loading, devices, objDevices]);

  return [objDevices, allDashboards, ensureLayoutLoaded];
}

const sendCommand = (dashboardId, deviceId, command, secondary = '') => {
  $.post({
    url: `${endpoint}sendCommand/${dashboardId}/?access_token=${access_token}`,
    data: JSON.stringify({id: parseInt(deviceId), cmd: command, secondary: secondary }),
    contentType: 'multipart/form-data',
    success: (data) => {
      
    }
  });
}

export default function({ children }) {
  const [devices, allDashboards, ensureLayoutLoaded] = useHub();

  return (
    <HubContext.Provider value={{ devices, allDashboards, ensureLayoutLoaded, sendCommand }}>
      {children}
    </HubContext.Provider>
  )
}