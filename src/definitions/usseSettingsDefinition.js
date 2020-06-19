import React, { useState } from 'react';

//util for autogen configs
export default function(definitions) {
  //so we can update multiple items in the state at once
  let preStateUpdate = {};

  let def = {};
  
  Object.values(definitions).forEach((section) => {
    section.sectionOptions.forEach(field => {
      def[field.name] = field.default;
    });
  });

  const [state, setState] = useState(def);

  function updateAffects(field, newVal) {
    field.affects.forEach(affected => {
      if(newVal === affected.value) {
        preStateUpdate[affected.name] = affected.setTo;
  
        //recursive changes
        //find field affected
        const affectedField = Object.values(definitions).reduce((sum, section) => {
          const affectedFieldIndex = section.sectionOptions.findIndex(field => field.name === affected.name);
          if(affectedFieldIndex !== -1) return section.sectionOptions;
          else return sum;
        }, []);

        if(affectedField.affects) updateAffects(affectedField, affected.setTo);
      };
    });
  }

  let ret = {};
  let setRet = {};
  Object.entries(definitions).forEach(([sectionName, section]) => {
    section.sectionOptions.forEach(field => {
    
    ret[field.name] = state[field.name];
    setRet[field.name] = (newVal) => {
      //set the state
      preStateUpdate[field.name] = newVal;

      //set the other states
      if(field.affects) {
        updateAffects(field, newVal);
      }

      setState(Object.assign({}, state, preStateUpdate));
    }
  });
});

  const mergeAll = (other) => {
    setState(Object.assign({}, state, other));
  }

  return [ret, setRet, mergeAll];
}