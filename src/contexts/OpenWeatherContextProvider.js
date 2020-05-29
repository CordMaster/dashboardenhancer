import React, { useState, useEffect, useMemo } from 'react';
import $ from 'jquery';
import { openWeatherToken } from '../Constants';
import useCachedDataSource from './useCachedDataSource';


export const OpenWeatherContext = React.createContext({});

export default function(props) {
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState({ coords: {} });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((gotPosition) => setPosition(gotPosition) & setReady(true));
  }, []);

  const [loaded, error, data] = useCachedDataSource('weather', `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial&appid=${openWeatherToken}`, ready, 60000);
  const parsedWeather = useMemo(() => {
    return data ? {
      loaded: true,
      current: data.current,
      future: data.daily.slice(0, 4)
    } : null;
  }, [data]);

  return <OpenWeatherContext.Provider value={{ loaded, error, ...parsedWeather }}>{props.children}</OpenWeatherContext.Provider>
}