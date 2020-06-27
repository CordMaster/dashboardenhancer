import React, { useState, useMemo } from 'react';
import deepmerge from 'deepmerge';

import InputComponents from '../components/InputComponents';
import { evalIfFunction } from '../Utils';

//util for autogen configs
export default function(definitions, _state, setState) {
  //merge defaults with state to manage undefined stuff
  const def = useMemo(() => {
    let def = {};

    Object.entries(definitions).forEach(([sectionName, section]) => {
      def[sectionName] = {};
      section.sectionOptions.forEach(field => {
        def[sectionName][field.name] = field.default;
      });
    });

    return def;
  }, []);

  const state = useMemo(() => deepmerge(def, _state), [def, _state]);

  //so we can update multiple items in the state at once
  let preStateUpdate = {};

  function updateAffects(field, newVal) {
    field.affects.forEach(affected => {
      if(newVal === affected.value) {
        const [afSectionName, afName] = affected.name.split('.');
        preStateUpdate[afSectionName][afName] = affected.setTo;
  
        //recursive changes
        //find field affected
        const [affectedSectionName, affectedSection] = Object.entries(definitions).find(([otherSectionName, section]) => otherSectionName === afSectionName);
        const affectedField = affectedSection.sectionOptions.find(field => field.name === afName);

        if(affectedField) {
          if(affectedField.affects) updateAffects(affectedField, affected.setTo);
        } else {
          //debug
          console.error('Could not find ' + affected.name);
        }
      };
    });
  }

  let setRet = {};
  Object.entries(definitions).forEach(([sectionName, section]) => {
    setRet[sectionName] = {};
    preStateUpdate[sectionName] = {};

    section.sectionOptions.forEach(field => {
      setRet[sectionName][field.name] = (newVal) => {
        //set the state
        preStateUpdate[sectionName][field.name] = newVal;

        //set the other states
        if(field.affects) {
          updateAffects(field, newVal);
        }

        setState(deepmerge(state, preStateUpdate));
      }
    });
  });

  const mergeAll = (other) => {
    setState(deepmerge({}, state, other));
  }

  return [state, setRet, mergeAll];
}

export const useSectionRenderer = (sectionName, section, config, setConfig, ...evalParams) => {
  const [cachedValues, setCachedValues] = useState(() => {
    return section.sectionOptions.reduce((sum, it) => {
      sum[it.name] = config[sectionName][it.name];
      return sum;
    }, {});
  });

  const evaluateDependsOn = dependsOn => {
    if(dependsOn) {
      for(let i = 0; i < dependsOn.length; i++) {
        const dependency = dependsOn[i];
        if(typeof(dependency.name) === 'function') {
          if(dependency.name(...evalParams) !== dependency.value) return true;
        }
        else if(dependency.name) {
          const [sectionName, name] = dependency.name.split('.');
          
          //debug
          if(setConfig[sectionName] && setConfig[sectionName][name]) {
            if(config[sectionName][name] !== dependency.value) return true;
          } else {
            console.error(`Could not find + ${sectionName}.${name}`);
          }
        }
      }
    }
    return false;
  }

  const handleChange = (name, value) => {
    if(section.saveBuffer) {
      setCachedValues({ ...cachedValues, [name]: value });
    } else {
      setConfig[sectionName][name](value);
    }
  }

  const children = section.sectionOptions.map((setting) => {
    const Type = InputComponents[setting.type];

    const evaluatedDepends = evaluateDependsOn(setting.dependsOn);
    const disabled = evaluatedDepends && setting.disableOnDepends;
    const hidden = evaluatedDepends && !setting.disableOnDepends;
    return !hidden && <Type key={setting.name} label={setting.label} values={evalIfFunction(setting.values, ...evalParams)} value={section.saveBuffer ? cachedValues[setting.name] : config[sectionName][setting.name]} disabled={disabled} setValue={value => handleChange(setting.name, value)} />;
  });

  const handleSave = () => {
    section.sectionOptions.forEach(it => {
      setConfig[sectionName][it.name](cachedValues[it.name]);
    });
  }

  const noShow = evaluateDependsOn(section.dependsOn);

  return [children, handleSave, noShow];
};