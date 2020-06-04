import React, { useState } from 'react';

export const LoadingContext = React.createContext();

export default function({ children }) {
  //go down loading by 1 til we get to 0
  const [loading, setLoading] = useState(3);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}