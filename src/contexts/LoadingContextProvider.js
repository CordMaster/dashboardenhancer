import React, { useState } from 'react';

export const LoadingContext = React.createContext();

export default function({ children }) {
  //loading progress 0 through 100
  const [loading, setLoading] = useState(0);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}