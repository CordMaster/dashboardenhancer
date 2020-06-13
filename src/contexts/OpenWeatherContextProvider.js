import React, { useState, useEffect, useMemo, useContext } from 'react';
import $ from 'jquery';
import { openWeatherToken } from '../Constants';
import useCachedDataSource from './useCachedDataSource';
import { MainContext } from './MainContextProvider';


export const OpenWeatherContext = React.createContext({});

export default function(props) {
  const { config } = useContext(MainContext);

  const position = useMemo(() => { return { coords: { latitude: config.latitude, longitude: config.longitude } } }, [config.latitude, config.longitude]);

  /*useEffect(() => {
    navigator.geolocation.getCurrentPosition((gotPosition) => setPosition(gotPosition));
  }, []);*/

  const [loaded, error, sync, data] = useCachedDataSource('weather', `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial&appid=${openWeatherToken}`, openWeatherToken && position.coords.latitude && position.coords.longitude, 1000 * 60 * config.weatherUpdateIntervalInMin);
  const parsedWeather = useMemo(() => {
    return data ? {
      loaded: true,
      current: data.current,
      future: data.daily.slice(0, 4)
    } : null;
  }, [data]);

  return <OpenWeatherContext.Provider value={{ loaded, error, sync, ...parsedWeather }}>{props.children}</OpenWeatherContext.Provider>
}