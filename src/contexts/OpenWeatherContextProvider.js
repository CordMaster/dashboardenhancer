import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { openWeatherToken } from '../Constants';


export const OpenWeatherContext = React.createContext({});

export default function(props) {
  const [currentWeather, setCurrentWeather] = useState({ loaded: false });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      $.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial&appid=${openWeatherToken}`, (data) => {
        console.log(data);
        setCurrentWeather({
          loaded: true,
          current: data.current,
          future: data.daily.slice(0, 4)
        });
      });    
    })
    
  }, []);

  return <OpenWeatherContext.Provider value={{ ...currentWeather }}>{props.children}</OpenWeatherContext.Provider>
}