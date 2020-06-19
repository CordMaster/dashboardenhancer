import React, { useReducer } from 'react';

import { Map } from 'immutable';
import { v4 as uuidv4 } from 'uuid';

export default function(initialState, newTemplate) {
  const reducer = (state, obj) => {
    const type = obj.type;
    if(type === "move") {
      const { startIndex, destIndex } = obj;
      const startObj = state.get(startIndex);
      const newArr = state.splice(startIndex, 1).insert(destIndex, startObj);

      return newArr;
    } else if(type === "delete") {
      const index = obj.index;

      const newArr = state.splice(index, 1);

      return newArr;
    } else if(type === "new") {
      const newData = Map(Object.assign({ id: uuidv4(), ...newTemplate }, obj.data));

      const newArr = state.push(newData);

      return newArr;
    } else if(type === "modify") {
      const index = obj.index;
      const newData = obj.data;

      const newArr = state.update(index, val => Map({ ...val.toJS(), ...newData }));

      return newArr;
    } else {
      return state;
    }
  }

  return useReducer(reducer, initialState);
}