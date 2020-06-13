import React, { useState, useEffect, useMemo, useContext } from 'react';
import $ from 'jquery';
import { openWeatherToken } from '../Constants';
import useCachedDataSource from './useCachedDataSource';
import { MainContext } from './MainContextProvider';


export const OpenWeatherContext = React.createContext({});

export default function(props) {
  const { config } = useContext(MainContext);

  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState({ coords: {} });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((gotPosition) => setPosition(gotPosition) & setReady(true));
  }, []);

  const [loaded, error, sync, data] = openWeatherToken ? useCachedDataSource('weather', `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial&appid=${openWeatherToken}`, ready, 1000 * 60 * config.weatherUpdateIntervalInMin) : [true, true, () => null, null];
  const parsedWeather = useMemo(() => {
    return data ? {
      loaded: true,
      current: data.current,
      future: data.daily.slice(0, 4)
    } : null;
  }, [data]);

  return <OpenWeatherContext.Provider value={{ loaded, error, sync, ...parsedWeather }}>{props.children}</OpenWeatherContext.Provider>
}