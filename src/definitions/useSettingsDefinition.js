import React, { useState, Fragment, useEffect, useMemo } from 'react';

import { Typography, TextField, Switch, FormControlLabel, FormControl } from '@material-ui/core';
import ColorPicker from '../components/colorpicker/ColorPicker';
import DevicePicker from '../components/devicepicker/DevicePicker';
import deepmerge from 'deepmerge';

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

export const useSectionRenderer = (sectionName, section, config, setConfig, passState) => {
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
          if(dependency.name(passState) !== dependency.value) return true;
        }
        else if(dependency.name) {
          const [sectionName, name] = dependency.name.split('.');
          if(config[sectionName][name] !== dependency.value) return true;
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
    let Type;

    switch(setting.type) {
      case 'text':
        Type = TextType;
        break;
      case 'number':
        Type = NumberType;
        break;
      case 'boolean':
        Type = BooleanType;
        break;
      case 'color':
        Type = ColorType;
        break;
      case 'deviceattribute':
        Type = DeviceAttributeType;
        break;
      default:
        Type = Typography;
        break;
    }

    const evaluatedDepends = evaluateDependsOn(setting.dependsOn);
    const disabled = evaluatedDepends && setting.disableOnDepends;
    const hidden = evaluatedDepends && !setting.disableOnDepends;
    return !hidden && <Type key={setting.name} label={setting.label} value={section.saveBuffer ? cachedValues[setting.name] : config[sectionName][setting.name]} disabled={disabled} setValue={value => handleChange(setting.name, value)} />;
  });

  const handleSave = () => {
    section.sectionOptions.forEach(it => {
      setConfig[sectionName][it.name](cachedValues[it.name]);
    });
  }

  const noShow = evaluateDependsOn(section.dependsOn);

  return [children, handleSave, noShow];
};

const BooleanType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <FormControlLabel control={<Switch />} label={label} checked={value} onChange={() => setValue(!value)} {...props} />
    </FormControl>
  );
});

const TextType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} {...props} />
    </FormControl>
  );
});

const NumberType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField type="number" label={label} value={value} onChange={(e) => setValue(parseFloat(e.target.value))} {...props} />
    </FormControl>
  );
});

const ColorType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <Fragment>
      <Typography variant="subtitle1">{label}</Typography>
      <ColorPicker value={value} onChange={(value) => setValue(value)} {...props} />
    </Fragment>
  );
});

const DeviceAttributeType = React.memo(({ value, setValue, ...props }) => {
  return <DevicePicker value={value} onChange={(value) => setValue(value)} {...props} />
});