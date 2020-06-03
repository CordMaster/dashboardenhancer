import React, { useState, useEffect, useMemo} from 'React';
import { hubIp } from '../Constants';

export const HubContext = React.createContext();

const websocket = new WebSocket(`ws://${hubIp}/eventsocket`);

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

export default function({ children }) {

  return (
    <HubContext.Provider value={{}}>
      {children}
    </HubContext.Provider>
  )
}