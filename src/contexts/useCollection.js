import React, { useState } from 'react';

import Immutable, { Map } from 'immutable';
import merge from 'deepmerge';

import { v4 as uuidv4 } from 'uuid';

export default function(initialState, newTemplate) {
  const [ret, setRetM] = useState(initialState);

  const setRet = useModifyImmutableCollection(ret, newTemplate, (state) => {
    setRetM(state);
  });

  return [ret, setRet, setRetM];
}

export function useModifyImmutableCollection(objState, newTemplate, onChange) {
  const state = Immutable.fromJS(objState);

  return obj => {
    const type = obj.type;
      if(type === "move") {
        const { srcIndex, destIndex } = obj;
        const startObj = state.get(srcIndex);
        const newArr = state.splice(srcIndex, 1).insert(destIndex, startObj);

        onChange(newArr.toJS());
      } else if(type === "delete") {
        const index = obj.index;

        const newArr = state.splice(index, 1);

        onChange(newArr.toJS());
      } else if(type === "new") {
        const newData = Map({ id: uuidv4(), ...newTemplate, ...obj.data });

        const newArr = state.push(newData);

        onChange(newArr.toJS());
      } else if(type === "modify") {
        const newData = obj.data;

        const newArr = state.update(obj.index, val => {
          return Immutable.fromJS(merge(val.toJS(), newData, { arrayMerge: (dest, src) => src }));
        });

        onChange(newArr.toJS());
      }
    }
}