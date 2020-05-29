import React, { useEffect, useState } from 'react';
import $ from 'jquery';

export default function(name, url, ready, updateInterval) {
  const [data, setData] = useState({ loaded: false, error: false });

  useEffect(() => {
    const cached = JSON.parse(window.localStorage.getItem(name));
    if(ready && (!cached || cached.timestamp + updateInterval <= Date.now())) {
      $.get(url, (data) => {
        console.log(`Got ${name}`);
        console.log(data);
  
        const parsedData = {
          loaded: true,
          error: false,
          data: data
        }
  
        setData(parsedData);
  
        //save data so we don't always reload
        window.localStorage.setItem(name, JSON.stringify({ timestamp: Date.now(), data: parsedData }));
      });
    } else if(cached) {
      setData(cached.data);
    }
  }, [ready]);

  return [ data.loaded, data.error, data.data ];
  
}