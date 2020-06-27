import React, { useState, useEffect, useContext, useMemo} from 'react';
import $ from 'jquery';
import merge from 'deepmerge';
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

  const [devices, setDevices] = useState({});

  //so we can update multiple items in the state at once
  let preStateUpdate = { ...devices };
  
  //for the first load
  useEffect(() => {
    if(loading === 10) {
      let devices = {};
      let loadedDevices = 0;

      $.get(`${endpoint}getDevices/?access_token=${access_token}`, (devicesData) => {
        devLog('Got device Ids');
        devLog(devicesData);

        devicesData.forEach(device => {
          devices[device.id] = device;
          $.get(`${endpoint}getDevice/${device.id}/?access_token=${access_token}`, (data) => {
            devices[device.id].attributes = {};
            data.forEach(attribute => {
              devices[device.id].attributes[attribute.name] = attribute;
            });

            devLog('Got device data');
            devLog(data);
          }).always(() => {
            loadedDevices++;
            
            if(loadedDevices === devicesData.length) {
              devLog('Finished getting device data');
              devLog(devices);

              setDevices(devices);
              setLoading(100);
            } else {
              setLoading(Math.max(loading, 10 + 90 / devicesData.length * loadedDevices));
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
        const toMerge = {
            [data.deviceId]: {
            attributes: {
              [data.name]: {
                currentState: data.value
              }
            }
          }
        }

        preStateUpdate = merge(preStateUpdate, toMerge);

        setDevices(preStateUpdate);
      }
    }

    if(loading >= 100 && Object.keys(devices).length > 0) websocket.addEventListener('message', onMessage);

    return () => {
      websocket.removeEventListener('message', onMessage);
    }
  }, [loading, devices]);

  return devices;
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
  const devices = useHub();

  return (
    <HubContext.Provider value={{ devices }}>
      {children}
    </HubContext.Provider>
  )
}