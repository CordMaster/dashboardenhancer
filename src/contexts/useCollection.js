import React, { useState } from 'react';

import Immutable, { Map } from 'immutable';
import { v4 as uuidv4 } from 'uuid';

export default function(initialState, newTemplate) {
  const [ret, setRetM] = useState(initialState);

  const setRet = modifyImmutableCollection(ret, newTemplate, (state) => {
    setRetM(state);
  });

  return [ret, setRet];
}

export function modifyImmutableCollection(objState, newTemplate, onChange) {
  const state = Immutable.fromJS(objState);

  return obj => {
    const type = obj.type;
      if(type === "move") {
        const { startIndex, destIndex } = obj;
        const startObj = state.get(startIndex);
        const newArr = state.splice(startIndex, 1).insert(destIndex, startObj);

        onChange(newArr.toJS());
      } else if(type === "delete") {
        const index = obj.index;

        const newArr = state.splice(index, 1);

        onChange(newArr.toJS());
      } else if(type === "new") {
        const newData = Map(Object.assign({ id: uuidv4(), ...newTemplate }, obj.data));

        const newArr = state.push(newData);

        onChange(newArr.toJS());
      } else if(type === "modify") {
        const newData = obj.data;

        const newArr = state.update(obj.index, val => Immutable.fromJS(Immutable.mergeDeep(val.toJS(), newData)));
        console.log(newArr.toJS());

        onChange(newArr.toJS());
      }
    }
}