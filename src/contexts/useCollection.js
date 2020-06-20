import React, { useReducer } from 'react';

import Immutable, { Map } from 'immutable';
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

      const newArr = state.removeIn(obj.path);

      return newArr;
    } else if(type === "new") {
      const newData = Map(Object.assign({ id: uuidv4(), ...newTemplate }, obj.data));

      const newArr = state.push(newData);

      return newArr;
    } else if(type === "modify") {
      const newData = obj.data;

      const newArr = state.updateIn(obj.path, val => Immutable.fromJS({ ...val.toJS(), ...newData }));

      return newArr;
    } else {
      return state;
    }
  }

  const [ret, setRet] = useReducer(reducer, initialState);

  return [ret.toJS(), setRet];
}